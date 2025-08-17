const express = require("express");
const authenticateToken = require("../middlewares/auth");
const User = require("../models/User");
const { role } = require("../middlewares/role");

const router = express.Router();

// Get current user's profile
router.get("/me", authenticateToken, async (req, res) => {
  res.json(req.user);
});

// Update current user's profile
router.put("/me", authenticateToken, async (req, res) => {
  try {
    const updates = (({ name, location }) => ({ name, location }))(req.body);
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, select: "-password" }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Example: Admin-only route
router.get("/admin-only", authenticateToken, role("admin"), (req, res) => {
  res.json({ message: "Welcome, admin! This route is protected." });
});

module.exports = router;
