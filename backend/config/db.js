const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/placement';
    console.log("🔗 Connecting to MongoDB database...");
    
    // Enhanced connection options
    await mongoose.connect(mongoURI, {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10, // Maximum number of connections in pool
    });
    
    console.log("✅ Connected to MongoDB");
    
    // Add connection event listeners for better debugging
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Full error details:", err);
    process.exit(1);
  }
};

module.exports = connectDB;