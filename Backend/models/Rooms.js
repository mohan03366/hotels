const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Room name is required"],
    trim: true,
    maxlength: [100, "Room name cannot exceed 100 characters"],
  },
  rentPerDay: {
    type: Number,
    required: [true, "Rent per day is required"],
    min: [0, "Rent cannot be negative"],
  },
  type: {
    type: String,
    required: [true, "Room type is required"],
    trim: true,
    enum: {
      values: ["Single", "Double", "Deluxe", "Suite", "Family", "Standard"],
      message: "Please select a valid room type",
    },
  },
  maxCount: {
    type: Number,
    required: [true, "Maximum count is required"],
    min: [1, "Maximum count must be at least 1"],
    max: [10, "Maximum count cannot exceed 10"],
  },
  images: [
    {
      type: String,
      validate: {
        validator: function (v) {
          // Basic URL validation
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        },
        message: "Please provide valid image URLs",
      },
    },
  ],
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    minlength: [10, "Description must be at least 10 characters long"],
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
  currentBookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
  ],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  amenities: [
    {
      type: String,
      trim: true,
    },
  ],
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
roomSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find available rooms
roomSchema.statics.findAvailableRooms = function () {
  return this.find({ isAvailable: true });
};

// Instance method to check availability for dates
roomSchema.methods.checkAvailability = function (checkInDate, checkOutDate) {
  // This would need to be implemented with actual booking logic
  return this.isAvailable;
};

// Virtual for formatted rent
roomSchema.virtual("formattedRent").get(function () {
  return `$${this.rentPerDay.toFixed(2)}/night`;
});

// Ensure virtual fields are serialized
roomSchema.set("toJSON", { virtuals: true });
roomSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Room", roomSchema);
