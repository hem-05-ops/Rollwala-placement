// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /api/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// POST /api/users/invite - Invite a new user
router.post('/users/invite', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
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
      forcePasswordChange: true
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
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isActive }, 
      { new: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});

// DELETE /api/users/:id - Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isSuperAdmin) {
      return res.status(400).json({ message: 'Cannot delete super admin' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;