const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

// Overview
router.get('/overview', requireAuth, requireSuperAdmin, analyticsController.getAnalyticsOverview);

// Applications analytics
router.get('/applications', requireAuth, requireSuperAdmin, analyticsController.getApplicationAnalytics);

// Jobs analytics
router.get('/jobs', requireAuth, requireSuperAdmin, analyticsController.getJobAnalytics);

// Users analytics
router.get('/users', requireAuth, requireSuperAdmin, analyticsController.getUserAnalytics);

// Full report
router.get('/report', requireAuth, requireSuperAdmin, analyticsController.getAnalyticsReport);

module.exports = router;