const mongoose = require("mongoose");
const mockDB = require("./mockDB");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn("MongoDB Atlas Connection Failed.");
    console.warn("Falling back to local file-based database (db.json)...");
    mockDB.enable();
  }
};

module.exports = connectDB;