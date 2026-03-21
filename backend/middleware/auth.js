const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

exports.requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists in database
    const user = await User.findById(payload.id || payload.sub || payload._id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // Check if user account is active (explicitly check if not true)
    // This catches false, null, undefined, and any other falsy values
    if (user.isActive !== true) {
      console.log(`Access blocked for deactivated user: ${user.email}, isActive: ${user.isActive}`);
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact the administrator.' });
    }

    // Add user information to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
  // Super admin can access everything
  if (req.user.role === 'super_admin') return next();
  
  // Check specific role requirement
  if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
  
  return next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
};

exports.requireSuperAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  return next();
};