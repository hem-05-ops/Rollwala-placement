const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Overview
router.get('/overview', analyticsController.getAnalyticsOverview);

// Applications analytics
router.get('/applications', analyticsController.getApplicationAnalytics);

// Jobs analytics
router.get('/jobs', analyticsController.getJobAnalytics);

// Users analytics
router.get('/users', analyticsController.getUserAnalytics);

// Full report
router.get('/report', analyticsController.getAnalyticsReport);

module.exports = router;