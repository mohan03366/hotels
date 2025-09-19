const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  searchUsers,
} = require("../controllers/UserController");
const protect = require("../Middleware/Authentication");

// Create a new user (public route for booking process)
router.post("/add_reservation", createUser);

// Get user by email (public route for booking process)
router.get("/email/:email", getUserByEmail);

// All other user routes require admin authentication

// Get all users (admin only)
router.get("/", protect, getUsers);

// Get user by ID (admin only)
router.get("/:id", protect, getUserById);

// Update user (admin only)
router.put("/:id", protect, updateUser);

// Delete user (admin only)
router.delete("/:id", protect, deleteUser);

// Search users (admin only)
router.get("/search", protect, searchUsers);

module.exports = router;
