const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import routes
const userRoutes = require("./routes/UserRoute");
const bookingRoutes = require("./routes/BookingRoute");
const roomRoutes = require("./routes/RoomsRoute");
const AdminRoute = require("./routes/AdminRoute");
const uploadRoute = require("./routes/UploadRoute");
const paymentRoutes = require("./routes/PaymnetRoute");

// Import database connection
const connectDB = require("./config/db");

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (if you have frontend build)
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/admin", AdminRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/payment", paymentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
    timestamp: new Date().toISOString(),
  });
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

// Server port
const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

module.exports = app;
