const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables first
dotenv.config();

// Connect to database
const connectDB = require("./config/db.js");
connectDB();

// Routes
const interviewExperienceRoutes = require("./routes/interviewExperienceRoutes");
const newsletterRoutes = require("./routes/newsletter");
const imageRoutes = require("./routes/imageRoutes");
const jobRoutes = require("./routes/jobRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminManagementRoutes = require("./routes/adminManagementRoutes");

const app = express();

// Enable CORS for local dev and production
const allowedOrigins = [
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://0.0.0.0:5000",
  "https://replit.com",
  "https://e10730a0-4104-441d-9f49-ca3437b497e7-00-1dst8xktgq1m2.sisko.replit.dev",
  // "https://pms-cgc-u.vercel.app",
];
const corsOptions = {
  origin: true, // Allow all origins in development
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// ✅ FIXED: Serve static files from frontend assets directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend assets (faculty images)
app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));

// Also keep uploads directory for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to DCS Backend 🚀");
});

// Routes
app.use("/api/interview-experiences", interviewExperienceRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin-management", adminManagementRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "localhost", () => {
  console.log(`🚀 Server running on localhost:${PORT}`);
  console.log(`📁 Serving assets from: ${path.join(__dirname, '../../frontend/src/assets')}`);
});