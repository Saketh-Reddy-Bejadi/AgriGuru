const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("../routes/auth");
const userRoutes = require("../routes/user");
const farmRoutes = require("../routes/farm");
const recommendationRoutes = require("../routes/recommendation");
const weatherRoutes = require("../routes/weather");
const marketRoutes = require("../routes/market");
const connectDB = require("../config/db");

app.use(express.json());
app.use(cors());

connectDB();
app.get("/", (req, res) => {
  res.send("AgriGuru Backend Running");
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/market", marketRoutes);

module.exports = app;
