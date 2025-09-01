const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// Generate JWT Token
const signToken = (id) => {
  console.log("yadav", process.env.JWT_SECRET);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Create and send token
const createSendToken = (admin, statusCode, res) => {
  console.log("admin in createSendToken", admin);
  const token = signToken(admin._id);
  console.log("token", token);
  // Remove password from output
  admin.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      admin,
    },
  });
};

// Admin Signup
const signup = async (req, res) => {
  try {
    const { fullName, email, password, passwordConfirm } = req.body;

    // Check if passwords match
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Create new admin
    const newAdmin = await Admin.create({
      fullName,
      email,
      password,
    });

    createSendToken(newAdmin, 201, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      //console.log(error.message);
    });
  }
};

// Admin Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // 2) Check if admin exists && password is correct
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !(await admin.correctPassword(password, admin.password))) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // 3) Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    // 4) Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    // 5) If everything ok, send token to client

    createSendToken(admin, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin Logout
const logout = (req, res) => {
  try {
    // For JWT, logout is handled on client side by removing the token
    // We can also blacklist tokens if needed (requires token blacklist implementation)

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all admins (protected)
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.status(200).json({
      success: true,
      results: admins.length,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current admin profile
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    res.status(200).json({
      success: true,
      data: {
        admin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update admin profile
const updateMe = async (req, res) => {
  try {
    // 1) Create error if admin POSTs password data
    if (req.body.password) {
      return res.status(400).json({
        success: false,
        message:
          "This route is not for password updates. Please use /updatepassword.",
      });
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = {};
    if (req.body.fullName) filteredBody.fullName = req.body.fullName;
    if (req.body.email) filteredBody.email = req.body.email;

    // 3) Update admin document
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: {
        admin: updatedAdmin,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete admin (deactivate)
const deleteAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(204).json({
      success: true,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    // 1) Get admin from collection
    const admin = await Admin.findById(req.admin.id).select("+password");

    // 2) Check if current password is correct
    if (!(await admin.correctPassword(currentPassword, admin.password))) {
      return res.status(401).json({
        success: false,
        message: "Your current password is wrong",
      });
    }

    // 3) Check if new passwords match
    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    // 4) Update password
    admin.password = newPassword;
    await admin.save();

    // 5) Log admin in, send JWT
    createSendToken(admin, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getAllAdmins,
  getMe,
  updateMe,
  deleteAdmin,
  changePassword,
};
