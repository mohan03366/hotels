const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: false,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    default: null,
  },
  amount: {
    type: Number,
    required: true, // amount in paise
    min: 1,
  },
  currency: {
    type: String,
    default: "INR",
    uppercase: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
    index: true,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
  razorpaySignature: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["created", "attempted", "paid", "failed"],
    default: "created",
  },
  notes: {
    type: Object,
    default: {},
  },
  quote: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

paymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
