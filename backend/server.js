// const path = require("path");
// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");

// // Load environment variables first
// dotenv.config();

// // Connect to database
// const connectDB = require("./config/db.js");
// connectDB();

// // Routes
// const interviewExperienceRoutes = require("./routes/interviewExperienceRoutes");
// const newsletterRoutes = require("./routes/newsletter");
// const imageRoutes = require("./routes/imageRoutes");
// const jobRoutes = require("./routes/jobRoutes");
// const authRoutes = require("./routes/authRoutes");
// const adminRoutes = require("./routes/adminRoutes");
// const adminManagementRoutes = require("./routes/adminManagementRoutes");
// const studentRoutes = require('./routes/studentRoutes');
// const userRoutes = require('./routes/userRoutes'); // ADD THIS LINE
// const applicationRoutes = require('./routes/applicationRoutes');




// const app = express();


// app.use('/api/students', studentRoutes);
// // Routes
// app.use("/api/interview-experiences", interviewExperienceRoutes);
// app.use("/api/newsletter", newsletterRoutes);
// app.use("/api/images", imageRoutes);
// app.use("/api/jobs", jobRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/admin-management", adminManagementRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api', userRoutes); // This will now work
// app.use('/api/applications', applicationRoutes);


// // Enable CORS for local dev and production
// const allowedOrigins = [
//   "http://localhost:5000",
//   "http://127.0.0.1:5000",
//   "http://0.0.0.0:5000",
//   "https://replit.com",
//   "https://e10730a0-4104-441d-9f49-ca3437b497e7-00-1dst8xktgq1m2.sisko.replit.dev",
//   // "https://pms-cgc-u.vercel.app",
// ];
// const corsOptions = {
//   origin: true, // Allow all origins in development
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
//   optionsSuccessStatus: 204,
// };
// app.use(cors(corsOptions));
// // app.use(cors({
// //   origin: true, // Allow all origins in development
// //   credentials: true
// // }));
// // Middleware
// app.use(express.json());

// // ✅ FIXED: Serve static files from frontend assets directory
// app.use(express.static(path.join(__dirname, 'public')));

// // Serve frontend assets (faculty images)
// app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));

// // Also keep uploads directory for uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Root route
// app.get("/", (req, res) => {
//   res.send("Welcome to DCS Backend 🚀");
// });

// // Add this before your routes
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//   next();
// });

// // Then your routes


// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, "localhost", () => {
//   console.log(`🚀 Server running on localhost:${PORT}`);
//   console.log(`📁 Serving assets from: ${path.join(__dirname, '../../frontend/src/assets')}`);
// });

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
const studentRoutes = require('./routes/studentRoutes');
const userRoutes = require('./routes/userRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

// Enable CORS
const corsOptions = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// ✅✅✅ CRITICAL FIX: API ROUTES MUST COME BEFORE STATIC FILES ✅✅✅
app.use('/api/students', studentRoutes);
app.use("/api/interview-experiences", interviewExperienceRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin-management", adminManagementRoutes);
app.use('/api/students', studentRoutes);
app.use('/api', userRoutes);
app.use('/api/applications', applicationRoutes); // ← This is your problem route

// ✅ Now serve static files (AFTER API routes)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add logging middleware to debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to DCS Backend 🚀");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "localhost", () => {
  console.log(`🚀 Server running on localhost:${PORT}`);
  console.log(`✅ API routes are configured BEFORE static files`);
});