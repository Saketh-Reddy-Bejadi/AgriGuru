const mongoose = require("mongoose");

const cropHistorySchema = new mongoose.Schema(
  {
    crop: { type: String, required: true },
    season: { type: String },
    year: { type: Number },
    yield: { type: Number },
    notes: { type: String },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
    address: { type: String },
  },
  { _id: false }
);

const farmSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  location: { type: locationSchema, required: true },
  size: { type: Number }, // In acres or hectares
  soilType: { type: String },
  irrigationType: { type: String },
  cropHistory: [cropHistorySchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Farm", farmSchema);
