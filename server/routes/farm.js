const express = require("express");
const authenticateToken = require("../middlewares/auth");
const Farm = require("../models/Farm");
const axios = require("axios");

const router = express.Router();

// Create a new farm
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      latitude,
      longitude,
      size,
      soilType,
      irrigationType,
      cropHistory,
    } = req.body;
    if (!name || latitude === undefined || longitude === undefined) {
      return res
        .status(400)
        .json({ message: "Name, latitude, and longitude are required." });
    }
    // Reverse geocode to get address using geocode.maps.co
    let address = "";
    try {
      const geoRes = await axios.get(
        `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=6870e60f62712223379840crwa8418f`
      );
      console.log(geoRes);
      address = geoRes.data.display_name || geoRes.data.address?.label || "";
    } catch (geoErr) {
      address = "";
    }
    const farm = new Farm({
      owner: req.user._id,
      name,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
        address,
      },
      size,
      soilType,
      irrigationType,
      cropHistory: cropHistory || [],
    });
    await farm.save();
    res.status(201).json(farm);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all farms for the authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const farms = await Farm.find({ owner: req.user._id });
    res.json(
      farms.map((farm) => ({
        ...farm.toObject(),
        location: {
          coordinates: farm.location.coordinates,
          address: farm.location.address,
        },
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get a single farm by ID (only owner or admin)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ message: "Farm not found." });
    if (!farm.owner.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }
    res.json({
      ...farm.toObject(),
      location: {
        coordinates: farm.location.coordinates,
        address: farm.location.address,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update a farm (only owner or admin)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ message: "Farm not found." });
    if (!farm.owner.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }
    const updates = (({
      name,
      location,
      size,
      soilType,
      irrigationType,
      cropHistory,
    }) => ({ name, location, size, soilType, irrigationType, cropHistory }))(
      req.body
    );
    Object.assign(farm, updates);
    await farm.save();
    res.json(farm);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete a farm (only owner or admin)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ message: "Farm not found." });
    if (!farm.owner.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }
    await farm.deleteOne();
    res.json({ message: "Farm deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
