const express = require("express");
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
} = require("../controllers/RoomsController");

// Create a new room
router.post("/create", createRoom);

// Get all rooms
router.get("/", getRooms);

// Get available rooms
router.get("/available", getAvailableRooms);

// Get room by ID
router.get("/:id", getRoomById);

// Update room
router.put("/:id", updateRoom);

// Delete room
router.delete("/:id", deleteRoom);

module.exports = router;
