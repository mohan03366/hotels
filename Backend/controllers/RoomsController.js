const Room = require("../models/Rooms");

// Create a new room
const createRoom = async (req, res) => {
  try {
    // Extract room data from request body
    const { name, rentPerDay, type, maxCount, description, amenities } =
      req.body;

    // Validate required fields
    if (!name || !rentPerDay || !type || !maxCount || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, rentPerDay, type, maxCount, description",
      });
    }

    // Parse amenities if provided as string
    let amenitiesArray = [];
    if (amenities) {
      if (typeof amenities === "string") {
        amenitiesArray = amenities
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item);
      } else if (Array.isArray(amenities)) {
        amenitiesArray = amenities;
      }
    }

    // Create room data object
    const roomData = {
      name: name.trim(),
      rentPerDay: parseFloat(rentPerDay),
      type: type.trim(),
      maxCount: parseInt(maxCount),
      description: description.trim(),
      amenities: amenitiesArray,
      images: [], // Will be populated if images are uploaded
      isAvailable: true,
    };

    // Create new room
    const room = new Room(roomData);
    const savedRoom = await room.save();

    res.status(201).json({
      success: true,
      data: savedRoom,
      message: "Room created successfully",
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: rooms,
      count: rooms.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update room
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
      message: "Room updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get available rooms
const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.findAvailableRooms();
    res.status(200).json({
      success: true,
      data: rooms,
      count: rooms.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update room images
const updateRoomImages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of image URLs",
      });
    }

    const room = await Room.findByIdAndUpdate(
      roomId,
      { images: imageUrls },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
      message: "Room images updated successfully",
    });
  } catch (error) {
    console.error("Error updating room images:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  updateRoomImages,
};
