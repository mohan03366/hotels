const Booking = require("../models/Booking");

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
    const booking = new Booking(req.body);
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
