const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
} = require("../controllers/PaymentController");

// Create Razorpay order for a booking
router.post("/create-order", createOrder);

// Verify Razorpay payment signature and mark booking paid
router.post("/verify", verifyPayment);

module.exports = router;
