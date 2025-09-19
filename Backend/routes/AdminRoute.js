const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getAllAdmins,
  getMe,
  updateMe,
  deleteAdmin,
} = require("../controllers/AdminController");

// Import auth middleware
const protect = require("../Middleware/Authentication");

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes (admin authentication required)
router.get("/", protect, getAllAdmins);
router.get("/me", protect, getMe);
router.patch("/updateme", protect, updateMe);
router.delete("/:id", protect, deleteAdmin);

module.exports = router;
