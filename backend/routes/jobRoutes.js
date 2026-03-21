const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jobController = require('../controllers/jobControllers'); // Fixed typo: was 'jobControllers'
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Local storage configuration
const uploadsDir = path.join(__dirname, '..', 'uploads');
const jobDescDir = path.join(uploadsDir, 'job_descriptions');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}
if (!fs.existsSync(jobDescDir)) {
  fs.mkdirSync(jobDescDir, { recursive: true });
  console.log('📁 Created job_descriptions subdirectory');
}

const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'jobDescriptionFile') {
      return cb(null, jobDescDir);
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
console.log('📁 Using local storage for job assets (logo + description)');

// Configure multer with the selected storage
const upload = multer({ 
  storage: uploadStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'companyLogo') {
      const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedImageTypes.test(file.mimetype);
      if (mimetype && extname) {
        return cb(null, true);
      }
      return cb(new Error('Only image files are allowed for company logo (jpeg, jpg, png, gif, webp)'));
    }

    if (file.fieldname === 'jobDescriptionFile') {
      const allowedDocMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (allowedDocMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
      }
      return cb(new Error('Only PDF, DOC, or DOCX files are allowed for Job Description.'));
    }

    // For any other file fields, do not throw; simply ignore the file
    return cb(null, false);
  }
});

// Public routes (read-only)
router.get('/', jobController.getAllJobs);

// Protected routes (admin only)
// Use upload.any() to accept multiple file fields (companyLogo, jobDescriptionFile, etc.)
router.post('/', requireAuth, requireAdmin, upload.any(), jobController.createJob);
router.put('/:id', requireAuth, requireAdmin, upload.any(), jobController.updateJob);
router.delete('/:id', requireAuth, requireAdmin, jobController.deleteJob);

// ✅ ADD THIS NEW ROUTE for testing emails (admin only)
router.get('/:id/test-email', requireAuth, requireAdmin, jobController.testJobEmail);

module.exports = router;