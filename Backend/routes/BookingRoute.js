const express = require("express");
const router = express.Router();
const {
  listAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  getReservationsByEmail,
  updatePaymentStatus,
} = require("../controllers/BookingController");
const protect = require("../Middleware/Authentication");

// Get all reservations (admin only)
router.get("/list_all_reservations", protect, listAllReservations);

// Get reservation by ID (admin only)
router.get("/:id", protect, getReservationById);

// Create new reservation (public)
router.post("/add_reservation", createReservation);

// Update reservation (admin only)
router.put("/:id", protect, updateReservation);

// Delete reservation (admin only)
router.delete("/delete_reservation/:id", protect, deleteReservation);

// Get reservations by email (admin only)
router.get("/user/:email", protect, getReservationsByEmail);

// Update payment status (admin only)
router.patch("/payment/:id", protect, updatePaymentStatus);

module.exports = router;
