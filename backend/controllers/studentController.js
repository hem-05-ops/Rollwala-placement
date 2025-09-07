const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const Student = require('../models/Student');
const Application = require('../models/Application');
const Job = require('../models/Job');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Student registration schema
const studentRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
  rollNo: z.string().min(1).max(20),
  course: z.enum(['BSc.CS', 'MSc.CS', 'MSc.AIML', 'MCA']),
  branch: z.enum(['WD', 'AIML']),
  year: z.enum(['1st', '2nd', '3rd', '4th', '5th']),
  cgpa: z.number().min(0).max(10),
  contact: z.string().min(10).max(15)
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Student registration
exports.registerStudent = async (req, res) => {
  try {
    const payload = studentRegisterSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if rollNo already exists
    const existingStudent = await Student.findOne({ rollNo: payload.rollNo });
    if (existingStudent) {
      return res.status(409).json({ error: 'Roll number already registered' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(payload.password, saltRounds);

    // Create user
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: 'student'
    });

    // Create student profile
    const student = await Student.create({
      user: user._id,
      rollNo: payload.rollNo,
      course: payload.course,
      branch: payload.branch,
      year: payload.year,
      cgpa: payload.cgpa,
      contact: payload.contact
    });

    const token = jwt.sign({ sub: user._id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    return res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        student: student
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    }
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get student profile
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const allowedUpdates = ['cgpa', 'contact', 'skills', 'projects', 'certifications', 'achievements', 'linkedin', 'github'];
    const updates = {};
    
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const student = await Student.findOneAndUpdate(
      { user: req.user.id },
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json({ message: 'Profile updated successfully', student });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Apply for job
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, formResponses } = req.body;
    
    // Get student info
    const student = await Student.findOne({ user: req.user.id }).populate('user');
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      student: student._id
    });
    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied for this job' });
    }

    // Create application
    const application = new Application({
      job: jobId,
      student: student._id,
      applicantName: student.user.name,
      applicantEmail: student.user.email,
      applicantPhone: student.contact,
      applicantCourse: student.course,
      applicantYear: student.year,
      applicantBranch: student.branch,
      formResponses: formResponses || []
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get student's applications
exports.getStudentApplications = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const applications = await Application.find({ student: student._id })
      .populate('job', 'companyName position salaryPackage location')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get eligible jobs for student
exports.getEligibleJobs = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Find jobs that match student's eligibility
    const jobs = await Job.find({
      $and: [
        {
          $or: [
            { eligibleCourses: { $in: [student.course] } },
            { eligibleCourses: { $size: 0 } }
          ]
        },
        {
          $or: [
            { eligibleBranches: { $in: [student.branch] } },
            { eligibleBranches: { $size: 0 } }
          ]
        },
        {
          $or: [
            { eligibleYears: { $in: [student.year] } },
            { eligibleYears: { $size: 0 } }
          ]
        }
      ]
    }).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Get eligible jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};