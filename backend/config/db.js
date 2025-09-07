const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Mongo URI:", process.env.MONGO_URI);
    
    // Remove the dbName option or set it to "placement"
    await mongoose.connect(process.env.MONGO_URI, {
      // Remove this line or change to: dbName: "placement",
      retryWrites: true,
      w: "majority",
    });
    
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;