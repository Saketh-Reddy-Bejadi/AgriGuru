const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["farmer", "expert", "admin"],
    default: "farmer",
    required: true,
  },
  location: { type: String }, // e.g., village, district, etc.
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
