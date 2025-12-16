const express = require('express');
const multer = require('multer');
const path = require('path');
const jobController = require('../controllers/jobControllers');
const applicationController = require('../controllers/applicationController');
const studentAdminController = require('../controllers/studentAdminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Public routes (read-only)
router.get('/', jobController.getAllJobs);

// Protected routes (admin only)
router.post('/', requireAuth, requireAdmin, upload.single('companyLogo'), jobController.createJob);
router.put('/:id', requireAuth, requireAdmin, upload.single('companyLogo'), jobController.updateJob);
router.delete('/:id', requireAuth, requireAdmin, jobController.deleteJob);

// Applications export
router.get('/export-applications', requireAuth, requireAdmin, applicationController.exportApplicationsExcel);

// Student approval management
router.get('/students/pending', requireAuth, requireAdmin, studentAdminController.getPendingStudents);
router.patch('/students/:id/approve', requireAuth, requireAdmin, studentAdminController.approveStudent);
router.delete('/students/:id/cancel', requireAuth, requireAdmin, studentAdminController.cancelStudent);

module.exports = router;