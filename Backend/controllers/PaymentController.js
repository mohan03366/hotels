const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/PaymentModel");
const Booking = require("../models/Booking");

function getRazorpayInstance() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are not configured in environment");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payment/create-order
// body: { bookingId } OR { quote }
const createOrder = async (req, res) => {
  try {
    const { bookingId, quote } = req.body;
    let booking = null;
    let amountPaise = null;
    let notes = {};

    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      }
      if (booking.paymentStatus === "paid") {
        return res
          .status(400)
          .json({ success: false, message: "Booking already paid" });
      }
      amountPaise = Math.round(Number(booking.totalAmount) * 100);
      notes = {
        bookingId: booking._id.toString(),
        userEmail: booking.userEmail,
      };
    } else if (quote) {
      let computed = quote.totalAmount;
      if (
        (computed === undefined || computed === null) &&
        quote.checkInDate &&
        quote.checkOutDate &&
        Array.isArray(quote.bookingInfo)
      ) {
        const ci = new Date(quote.checkInDate);
        const co = new Date(quote.checkOutDate);
        const diffMs = Math.abs(co - ci);
        const nights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        computed = quote.bookingInfo.reduce((sum, info) => {
          return sum + Number(info.roomAmount || 0) * nights;
        }, 0);
      }
      amountPaise = Math.round(Number(computed) * 100);
      notes = { quote: "true", userEmail: quote.userEmail || quote.email };
    } else {
      return res
        .status(400)
        .json({ success: false, message: "bookingId or quote is required" });
    }

    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking amount" });
    }

    const razorpay = getRazorpayInstance();
    const options = {
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${
        booking
          ? booking._id.toString()
          : Math.random().toString(36).substr(2, 8)
      }`,
      notes,
    };
    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      bookingId: booking ? booking._id : null,
      userId: booking ? booking.userId || null : null,
      amount: amountPaise,
      currency: order.currency,
      razorpayOrderId: order.id,
      status: "created",
      notes: options.notes,
      quote: quote || {},
    });

    if (booking) {
      await Booking.findByIdAndUpdate(booking._id, {
        paymentStatus: "pending",
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        order,
        payment,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payment/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      await Payment.findByIdAndUpdate(payment._id, {
        status: "failed",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });
      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: "failed",
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    let updatedPayment = await Payment.findByIdAndUpdate(
      payment._id,
      {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );
    let updatedBooking = null;
    if (payment.bookingId) {
      updatedBooking = await Booking.findByIdAndUpdate(
        payment.bookingId,
        {
          paymentStatus: "paid",
          paymentId: razorpay_payment_id,
        },
        { new: true }
      )
        .populate("userId")
        .populate("bookingInfo.roomId");
    } else {
      // Create booking from quote
      const q = payment.quote || {};
      if (
        !q ||
        !q.userEmail ||
        !q.checkInDate ||
        !q.checkOutDate ||
        !Array.isArray(q.bookingInfo)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid quote to create booking" });
      }
      const payload = { ...q };
      payload.paymentStatus = "paid";
      payload.paymentId = razorpay_payment_id;
      try {
        const created = await new Booking(payload).save();
        updatedBooking = await Booking.findById(created._id)
          .populate("userId")
          .populate("bookingInfo.roomId");
        // Link payment to booking
        updatedPayment = await Payment.findByIdAndUpdate(
          payment._id,
          { bookingId: created._id },
          { new: true }
        );
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: "Failed to create booking from quote",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified",
      data: {
        booking: updatedBooking,
        payment: updatedPayment,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, verifyPayment };
