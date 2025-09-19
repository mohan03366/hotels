const express = require("express");
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  updateRoomImages,
} = require("../controllers/RoomsController");
const protect = require("../Middleware/Authentication");

// Public routes (no authentication required)
// Get available rooms (for public booking)
router.get("/available", getAvailableRooms);

// Get room by ID (for public viewing)
router.get("/:id", getRoomById);

// Protected routes (admin authentication required)
// Create a new room (admin only)
router.post("/create", protect, createRoom);

// Get all rooms (admin only)
router.get("/", protect, getRooms);

// Update room (admin only)
router.put("/:id", protect, updateRoom);

// Update room images (admin only)
router.put("/:roomId/images", protect, updateRoomImages);

// Delete room (admin only)
router.delete("/:id", protect, deleteRoom);

module.exports = router;
