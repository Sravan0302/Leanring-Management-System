const mongoose = require("mongoose");
const mockDB = require("./mockDB");

const connectDB = async () => {
  try {
    console.log("Attempting database connection to URI:", process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ":****@") : "undefined");
    // Attempt connection with a 20-second selection timeout to support slower network connections
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000
    });

    console.log("MongoDB Connected successfully.");
  } catch (error) {
    console.error("MongoDB Connection Error Details:", error);
    console.warn("MongoDB Atlas Connection Failed or Timed Out.");
    console.warn("Falling back to local file-based database (db.json)...");
    mockDB.enable();
  }
};

module.exports = connectDB;