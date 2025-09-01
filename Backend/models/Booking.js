const mongoose = require("mongoose");

const paxSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  adultStatus: {
    type: String,
    enum: ["adult", "child"],
    default: "adult",
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
  },
});

const bookingInfoSchema = new mongoose.Schema({
  pax: [paxSchema],
  roomType: {
    type: String,
    required: true,
    trim: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  roomAmount: {
    type: Number,
    required: true,
    min: 1,
  },
});

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
  paymentId: {
    type: String,
    default: null,
  },
  bookCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  paymentStatus: {
    type: String,
    enum: ["not-paid", "pending", "paid", "refunded", "failed"],
    default: "not-paid",
  },
  isPast: {
    type: Boolean,
    default: false,
  },
  bookingInfo: [bookingInfoSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
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

// Update the updatedAt field before saving
bookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Generate booking code if not exists
  if (!this.bookCode) {
    this.bookCode =
      "BK" + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // Update isPast based on checkOutDate
  this.isPast = this.checkOutDate < new Date();

  next();
});

// Static method to find bookings by user
bookingSchema.statics.findByUserId = function (userId) {
  return this.find({ userId })
    .populate("userId")
    .populate("bookingInfo.roomId");
};

// Static method to find bookings by payment status
bookingSchema.statics.findByPaymentStatus = function (status) {
  return this.find({ paymentStatus: status });
};

// Instance method to calculate total nights
bookingSchema.methods.calculateNights = function () {
  const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Virtual for total amount with nights calculation
bookingSchema.virtual("calculatedTotal").get(function () {
  const nights = this.calculateNights();
  return this.bookingInfo.reduce((total, info) => {
    return total + info.roomAmount * nights;
  }, 0);
});

// Ensure virtual fields are serialized
bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Booking", bookingSchema);
