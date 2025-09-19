const Booking = require("../models/Booking");
const User = require("../models/UserModel");

// Get all reservations
const listAllReservations = async (req, res) => {
  try {
    const reservations = await Booking.find()
      .populate("userId")
      .populate("bookingInfo.roomId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reservations,
      count: reservations.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get reservation by ID
const getReservationById = async (req, res) => {
  try {
    const reservation = await Booking.findById(req.params.id)
      .populate("userId")
      .populate("bookingInfo.roomId");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      success: true,
      reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new reservation
const createReservation = async (req, res) => {
  try {
    const payload = { ...req.body };
    console.log("payload...", payload);

    // 1) Upsert user profile if userId not provided
    if (!payload.userId && payload.userEmail) {
      try {
        const providedAddress = payload.userAddress || payload.address || {};
        const providedFields = {
          name: payload.name || payload.fullName,
          email: payload.userEmail,
          phone: payload.phone,
          address: {
            street: providedAddress.street || payload.address,
            street2: providedAddress.street2 || payload.address2,
            city: providedAddress.city || payload.city,
            state: providedAddress.state || payload.state,
            zip: providedAddress.zip || payload.zip,
            country: providedAddress.country || payload.country,
          },
        };

        // Find existing user by email
        const existing = await User.findOne({ email: providedFields.email });
        if (existing) {
          const updates = {};
          if (providedFields.name) updates.name = providedFields.name;
          if (providedFields.phone) updates.phone = providedFields.phone;
          // Only set subfields if provided
          const addrUpdates = {};
          if (providedFields.address) {
            if (providedFields.address.street)
              addrUpdates["address.street"] = providedFields.address.street;
            if (providedFields.address.street2)
              addrUpdates["address.street2"] = providedFields.address.street2;
            if (providedFields.address.city)
              addrUpdates["address.city"] = providedFields.address.city;
            if (providedFields.address.state)
              addrUpdates["address.state"] = providedFields.address.state;
            if (providedFields.address.zip)
              addrUpdates["address.zip"] = providedFields.address.zip;
            if (providedFields.address.country)
              addrUpdates["address.country"] = providedFields.address.country;
          }
          const finalUpdates = { ...updates, ...addrUpdates };
          if (Object.keys(finalUpdates).length > 0) {
            await User.findByIdAndUpdate(
              existing._id,
              { $set: finalUpdates },
              { new: true }
            );
          }
          payload.userId = existing._id;
        } else {
          // Creating new user requires required fields to be present
          const requiredMissing =
            !providedFields.name ||
            !providedFields.phone ||
            !providedFields.address?.street ||
            !providedFields.address?.city ||
            !providedFields.address?.state ||
            !providedFields.address?.zip ||
            !providedFields.address?.country;
          if (requiredMissing) {
            // Not enough data to create user; skip creating but keep booking
          } else {
            const created = await User.create({
              name: providedFields.name,
              email: providedFields.email,
              phone: providedFields.phone,
              address: {
                street: providedFields.address.street,
                street2: providedFields.address.street2 || "",
                city: providedFields.address.city,
                state: providedFields.address.state,
                zip: providedFields.address.zip,
                country: providedFields.address.country,
              },
            });
            payload.userId = created._id;
          }
        }
      } catch (e) {
        // continue without user if upsert fails
      }
    }

    // 2) Ensure paymentStatus defaults to pending for unpaid flow
    if (!payload.paymentStatus) {
      payload.paymentStatus = "pending";
    }

    // 3) Compute totalAmount if not provided
    if (
      (payload.totalAmount === undefined || payload.totalAmount === null) &&
      Array.isArray(payload.bookingInfo) &&
      payload.checkInDate &&
      payload.checkOutDate
    ) {
      const checkIn = new Date(payload.checkInDate);
      const checkOut = new Date(payload.checkOutDate);
      const diffMs = Math.abs(checkOut - checkIn);
      const nights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      payload.totalAmount = payload.bookingInfo.reduce((sum, info) => {
        return sum + Number(info.roomAmount || 0) * nights;
      }, 0);
    }

    const booking = new Booking(payload);
    const savedBooking = await booking.save();

    // Populate the saved booking
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate("userId")
      .populate("bookingInfo.roomId");

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      reservation: populatedBooking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update reservation
const updateReservation = async (req, res) => {
  try {
    const reservation = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("userId")
      .populate("bookingInfo.roomId");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reservation updated successfully",
      reservation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete reservation
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Booking.findByIdAndDelete(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get reservations by user email
const getReservationsByEmail = async (req, res) => {
  try {
    const reservations = await Booking.find({ userEmail: req.params.email })
      .populate("userId")
      .populate("bookingInfo.roomId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reservations,
      count: reservations.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const reservation = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentId },
      { new: true, runValidators: true }
    )
      .populate("userId")
      .populate("bookingInfo.roomId");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      reservation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  listAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  getReservationsByEmail,
  updatePaymentStatus,
};
