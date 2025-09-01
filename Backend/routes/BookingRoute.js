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

// Get all reservations
router.get("/list_all_reservations", listAllReservations);

// Get reservation by ID
router.get("/:id", getReservationById);

// Create new reservation
router.post("/add_reservation", createReservation);

// Update reservation
router.put("/:id", updateReservation);

// Delete reservation
router.delete("/delete_reservation/:id", deleteReservation);

// Get reservations by email
router.get("/user/:email", getReservationsByEmail);

// Update payment status
router.patch("/payment/:id", updatePaymentStatus);

module.exports = router;
