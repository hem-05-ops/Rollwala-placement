const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminContoller');
const { requireAuth, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

// Get all admins (super admin only)
router.get('/admins', requireAuth, requireSuperAdmin, adminController.getAllAdmins);

// Invite new admin (super admin only)
router.post('/invite', requireAuth, requireSuperAdmin, adminController.inviteAdmin);

// Update admin (super admin only)
router.put('/update/:id', requireAuth, requireSuperAdmin, adminController.updateAdmin);

// Delete admin (super admin only)
router.delete('/delete/:id', requireAuth, requireSuperAdmin, adminController.deleteAdmin);

// Change password (any admin)
router.put('/change-password', requireAuth, requireAdmin, adminController.changePassword);

module.exports = router;
