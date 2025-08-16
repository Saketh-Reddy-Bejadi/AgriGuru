// AgriGuru Backend Server Entry Point
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const farmRoutes = require("./routes/farm");
const recommendationRoutes = require("./routes/recommendation");
const weatherRoutes = require("./routes/weather");
const marketRoutes = require("./routes/market");

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("AgriGuru Backend Running");
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/market", marketRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
