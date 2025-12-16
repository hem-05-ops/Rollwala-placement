const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const Student = require('../models/Student');
const PasswordResetOtp = require('../models/PasswordResetOtp');
const { createTransporter } = require('../services/emailService');

const registerSchema = z
  .object({
    name: z.string().min(2).max(100),
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128)
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required');
  process.exit(1);
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const RESET_TOKEN_EXPIRES_IN = process.env.RESET_TOKEN_EXPIRES_IN || '15m';

const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim()
});

const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: 'OTP must be a 6-digit code' })
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128)
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

exports.register = async (req, res) => {
  try {
    const payload = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: payload.email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(payload.password, saltRounds);

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      passwordHash
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' }); // Changed message
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If this is a student, ensure they have been approved before allowing login
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (!student) {
        return res.status(403).json({ error: 'Student profile not found. Please contact the administrator.' });
      }

      if (!student.isApproved) {
        return res.status(403).json({ error: 'Your account is pending approval by the administrator.' });
      }
    }

    const token = jwt.sign({ sub: user._id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await User.findOne({ email });

    // Always respond the same to avoid leaking whether the email exists
    const genericResponse = {
      message: 'If an account with that email exists, an OTP has been sent.'
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Invalidate previous unused OTPs for this user
    await PasswordResetOtp.updateMany(
      { userId: user._id, isUsed: false },
      { $set: { isUsed: true } }
    );

    // Generate secure 6-digit OTP
    const otpNumber = Math.floor(100000 + Math.random() * 900000);
    const otp = String(otpNumber);

    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await PasswordResetOtp.create({
      userId: user._id,
      email,
      otp: otpHash,
      expiresAt,
      isUsed: false
    });

    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: `"${process.env.EMAIL_SENDER_NAME || 'Department of Computer Science, Gujarat University'}" <${
          process.env.EMAIL_USERNAME
        }>`,
        to: email,
        subject: 'Your password reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 16px;">
            <h2 style="color: #1e40af; margin-bottom: 8px;">Password Reset Request</h2>
            <p style="margin-bottom: 12px;">
              Use the following One-Time Password (OTP) to reset your account password. 
            </p>
            <p style="font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #1e293b; margin: 16px 0;">
              ${otp}
            </p>
            <p style="margin-bottom: 8px;">This OTP will expire in 10 minutes.</p>
            <p style="font-size: 12px; color: #6b7280;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error('Error sending password reset OTP email:', emailErr);
      // Intentionally keep response generic
    }

    return res.status(200).json(genericResponse);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    }
    console.error('forgotPassword error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = verifyOtpSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const record = await PasswordResetOtp.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .exec();

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    if (record.isUsed || record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    record.isUsed = true;
    await record.save();

    // Issue short-lived password reset token
    const resetToken = jwt.sign(
      {
        sub: user._id,
        email: user.email,
        purpose: 'password_reset'
      },
      JWT_SECRET,
      { expiresIn: RESET_TOKEN_EXPIRES_IN }
    );

    return res.status(200).json({
      message: 'OTP verified successfully',
      resetToken
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    }
    console.error('verifyOtp error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = resetPasswordSchema.parse(req.body);

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (payload.purpose !== 'password_reset' || !payload.sub) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.lastPasswordChange = new Date();
    user.forcePasswordChange = false;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    }
    console.error('resetPassword error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


