const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
};

module.exports = connectDB;
