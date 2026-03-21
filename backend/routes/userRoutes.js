// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/users - Get all users (admin and super_admin can access)
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    let query = {};
    
    // If user is admin (not super_admin), exclude super_admin and admin users
    // Admin users can only manage students and faculty
    if (req.user.role === 'admin') {
      query = { role: { $nin: ['super_admin', 'admin'] } };
    }
    
    const users = await User.find(query).select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// POST /api/users/invite - Invite a new user
router.post('/users/invite', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Prevent admin users from inviting super_admin or admin users
    // Admin users can only invite students and faculty
    if (req.user.role === 'admin' && (role === 'super_admin' || role === 'admin')) {
      return res.status(403).json({ message: 'Admin users can only invite students and faculty' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);
    
    // Create new user
    const newUser = new User({
      name,
      email,
      role,
      passwordHash: hashedPassword,
      forcePasswordChange: true,
      isSuperAdmin: role === 'super_admin'
    });
    
    await newUser.save();
    
    // Return user without password hash
    const userResponse = { ...newUser.toObject() };
    delete userResponse.passwordHash;
    
    res.status(201).json({ 
      user: userResponse, 
      tempPassword 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error inviting user', error: error.message });
  }
});

// PATCH /api/users/:id/status - Toggle user status
router.patch('/users/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin users from modifying super_admin or admin users
    // Admin users can only modify students and faculty
    if (req.user.role === 'admin' && (user.role === 'super_admin' || user.role === 'admin' || user.isSuperAdmin)) {
      return res.status(403).json({ message: 'Admin users can only modify students and faculty' });
    }
    
    const { isActive } = req.body;
    
    // Ensure isActive is explicitly set as a boolean
    const isActiveValue = isActive === true || isActive === 'true' || isActive === 1;
    
    // Update user and explicitly set isActive
    user.isActive = isActiveValue;
    await user.save();
    
    const updatedUser = await User.findById(req.params.id).select('-passwordHash');
    
    console.log(`User ${user.email} status updated: isActive = ${updatedUser.isActive}`);
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});

// DELETE /api/users/:id - Delete a user
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting super_admin users
    if (user.role === 'super_admin' || user.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot delete super admin' });
    }
    
    // Prevent admin users from deleting super_admin or admin users
    // Admin users can only delete students and faculty
    if (req.user.role === 'admin' && (user.role === 'super_admin' || user.role === 'admin' || user.isSuperAdmin)) {
      return res.status(403).json({ message: 'Admin users can only delete students and faculty' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;