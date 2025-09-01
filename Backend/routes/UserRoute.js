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

// Create a new user
router.post("/users", createUser);

// Get all users
router.get("/users", getUsers);

// Get user by ID
router.get("/users/:id", getUserById);

// Get user by email
router.get("/users/email/:email", getUserByEmail);

// Update user
router.put("/users/:id", updateUser);

// Delete user
router.delete("/users/:id", deleteUser);

// Search users
router.get("/search/users", searchUsers);

module.exports = router;
