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
// const userRoutes = require('./routes/userRoutes');
// const applicationRoutes = require('./routes/applicationRoutes');
// const analyticsRoutes = require('./routes/analyticsRoutes');

// const app = express();

// // Enable CORS
// const corsOptions = {
//   origin: [
//     "http://localhost:3000", // if frontend is served on same port in prod
//     "http://localhost:5173", // Vite default dev port
//     "http://localhost:5000", // legacy
//     "http://192.168.91.1:5000"
//   ],
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
//   optionsSuccessStatus: 204,
// };
// app.use(cors(corsOptions));

// // app.use(cors(corsOptions));

// // Middleware
// app.use(express.json());

// // ✅✅✅ CRITICAL FIX: API ROUTES MUST COME BEFORE STATIC FILES ✅✅✅
// app.use('/api/students', studentRoutes);
// app.use("/api/interview-experiences", interviewExperienceRoutes);
// app.use("/api/newsletter", newsletterRoutes);
// app.use("/api/images", imageRoutes);
// app.use("/api/jobs", jobRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/admin-management", adminManagementRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api', userRoutes);
// app.use('/api/applications', applicationRoutes); // ← This is your problem route
// app.use('/api/analytics', analyticsRoutes);

// // ✅ Now serve static files (AFTER API routes)
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Add logging middleware to debug
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//   next();
// });

// // Root route
// app.get("/", (req, res) => {
//   res.send("Welcome to DCS Backend 🚀");
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, "localhost", () => {
//   console.log(`🚀 Server running on localhost:${PORT}`);
//   console.log(`✅ API routes are configured BEFORE static files`);
// });

const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables FIRST with explicit path
const envPath = path.resolve(__dirname, '.env');
console.log(`🔍 Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

// Debug: Check if environment variables are loaded
console.log('🔍 Environment Check:');
console.log('- EMAIL_USERNAME:', process.env.EMAIL_USERNAME ? '***' : 'MISSING');
console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' : 'MISSING');
console.log('- MONGO_URI:', process.env.MONGO_URI ? 'set' : 'MISSING');

// Connect to database
const connectDB = require("./config/db.js");
connectDB();

// Import email service for testing
const { testEmailConnection } = require("./services/emailService");

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
const analyticsRoutes = require('./routes/analyticsRoutes');
const practiceRoutes = require('./routes/practiceRoutes');

const app = express();

// Enable CORS
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000",
    "http://192.168.91.1:5000"
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Add comprehensive debug route
app.get('/api/debug/env', (req, res) => {
  res.json({
    email: {
      username: process.env.EMAIL_USERNAME ? 'set' : 'missing',
      password: process.env.EMAIL_PASSWORD ? 'set' : 'missing',
      host: process.env.EMAIL_HOST || 'not set',
      port: process.env.EMAIL_PORT || 'not set'
    },
    mongo: {
      uri: process.env.MONGO_URI ? 'set' : 'missing'
    },
    server: {
      port: process.env.PORT || '3000 (default)'
    }
  });
});

// API Routes
app.use('/api/students', studentRoutes);
app.use("/api/interview-experiences", interviewExperienceRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin-management", adminManagementRoutes);
app.use('/api', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/practice', practiceRoutes);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to DCS Backend 🚀");
});

app.get('/api/test-email-simple', async (req, res) => {
  try {
    const { testEmailConnection, sendBulkEmail } = require('./services/emailService');
    
    console.log('🧪 Testing email service...');
    const emailReady = await testEmailConnection();
    
    if (!emailReady) {
      return res.json({ success: false, message: 'Email service not ready' });
    }

    const testEmail = process.env.EMAIL_USERNAME;
    const subject = '🧪 Test Email from Placement Portal';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #1e40af;">Test Email ✅</h2>
        <p>This is a test email from your placement portal application.</p>
        <p>If you receive this, your email service is working perfectly!</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Server:</strong> localhost:3000</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    console.log(`📧 Sending test email to: ${testEmail}`);
    const summary = await sendBulkEmail([testEmail], subject, html);
    
    console.log(`✅ Email delivery: sent=${summary.sent} failed=${summary.failed}`);
    
    res.json({
      success: true,
      message: 'Test email sent successfully!',
      to: testEmail,
      sent: summary.sent,
      failed: summary.failed
    });
    
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send test email', 
      details: error.message 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on localhost:${PORT}`);
  
  // Test email configuration on startup
  setTimeout(() => {
    testEmailConnection().then(success => {
      if (success) {
        console.log('✅ Email service ready for notifications');
      } else {
        console.log('❌ Email service needs configuration');
        console.log('💡 Check your .env file and visit /api/debug/env to verify settings');
      }
    });
  }, 1000);
});