const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/placement';
    console.log("Mongo URI:", mongoURI);
    
    // Remove the dbName option or set it to "placement"
    await mongoose.connect(mongoURI, {
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