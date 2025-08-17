const express = require("express");
const axios = require("axios");
const authenticateToken = require("../middlewares/auth");
const Farm = require("../models/Farm");

const router = express.Router();

// GET /api/weather?farmId=... OR /api/weather?lat=...&lon=...
router.get("/", authenticateToken, async (req, res) => {
  let lat, lon;

  if (req.query.farmId) {
    // Fetch farm and check ownership
    const farm = await Farm.findById(req.query.farmId);
    if (!farm) return res.status(404).json({ message: "Farm not found." });
    if (!farm.owner.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }
    // Use GeoJSON coordinates: [lon, lat]
    if (
      farm.location &&
      Array.isArray(farm.location.coordinates) &&
      farm.location.coordinates.length === 2
    ) {
      [lon, lat] = farm.location.coordinates;
    } else {
      return res
        .status(400)
        .json({ message: "Farm does not have valid coordinates." });
    }
  } else if (req.query.lat && req.query.lon) {
    lat = req.query.lat;
    lon = req.query.lon;
  } else {
    return res
      .status(400)
      .json({ message: "Either farmId or lat/lon coordinates are required." });
  }

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ message: "Latitude and longitude are required." });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,precipitation,weathercode,relative_humidity_2m,wind_speed_10m&forecast_days=2`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch weather data", error: err.message });
  }
});

module.exports = router;
