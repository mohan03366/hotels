const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const protect = require("../Middleware/Authentication");

// Upload single image
router.post("/single", protect, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        imageUrl: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message,
    });
  }
});

// Upload multiple images
router.post("/multiple", protect, upload.array("images", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided",
      });
    }

    const imageUrls = req.files.map((file) => ({
      imageUrl: file.path,
      publicId: file.filename,
    }));

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data: {
        images: imageUrls,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading images",
      error: error.message,
    });
  }
});

// Delete image from Cloudinary
router.delete("/:publicId", protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    const cloudinary = require("../utils/cloudinary");

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
});

module.exports = router;
