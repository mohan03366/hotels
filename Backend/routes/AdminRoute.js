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

// Import auth middleware (you'll need to create this)
// const { protect, restrictTo } = require('../middlewares/auth');

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes (uncomment when you have auth middleware)
// router.get('/', protect, restrictTo('superadmin'), getAllAdmins);
// router.get('/me', protect, getMe);
// router.patch('/updateme', protect, updateMe);
// router.delete('/:id', protect, restrictTo('superadmin'), deleteAdmin);

// For now, use these without protection
router.get("/", getAllAdmins);
router.get("/me", getMe);
router.patch("/updateme", updateMe);
router.delete("/:id", deleteAdmin);

module.exports = router;
