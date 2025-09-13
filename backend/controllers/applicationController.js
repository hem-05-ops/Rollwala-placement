// backend/controllers/applicationController.js
const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');

// Submit a job application
exports.submitApplication = async (req, res) => {
  try {
    const { jobId, formResponses, applicantData } = req.body;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Get student data (assuming student is logged in)
    const studentId = req.user._id; // Assuming you have authentication
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if student already applied for this job
    const existingApplication = await Application.findOne({
      job: jobId,
      student: studentId
    });
    
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }
    
    // Create new application
    const application = new Application({
      job: jobId,
      student: studentId,
      applicantName: applicantData?.applicantName || student.name,
      applicantEmail: applicantData?.applicantEmail || student.email,
      applicantPhone: applicantData?.applicantPhone || student.phone,
      applicantCourse: applicantData?.applicantCourse || student.course,
      applicantYear: applicantData?.applicantYear || student.year,
      applicantBranch: applicantData?.applicantBranch || student.branch,
      formResponses
    });
    
    await application.save();
    
    // Populate the saved application for response
    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title company')
      .populate('student', 'name email phone course year branch');
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: populatedApplication
    });
  } catch (err) {
    console.error('Error submitting application:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all applications for a specific job (admin only)
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const applications = await Application.find({ job: jobId })
      .populate('job', 'title company')
      .populate('student', 'name email phone course year branch')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (err) {
    console.error('Error fetching job applications:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all applications across all jobs (admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title company')
      .populate('student', 'name email phone course year branch')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (err) {
    console.error('Error fetching all applications:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update application status (admin only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, adminNotes, interviewDate, interviewRound, feedback } = req.body;
    
    const updateData = { status };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (interviewDate !== undefined) updateData.interviewDate = interviewDate;
    if (interviewRound !== undefined) updateData.interviewRound = interviewRound;
    if (feedback !== undefined) updateData.feedback = feedback;
    
    const application = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    )
    .populate('job', 'title company')
    .populate('student', 'name email phone course year branch');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(application);
  } catch (err) {
    console.error('Error updating application:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get application statistics (admin only)
exports.getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalApplications = await Application.countDocuments();
    
    // Get stats by job
    const jobStats = await Application.aggregate([
      {
        $group: {
          _id: '$job',
          total: { $sum: 1 },
          statusCounts: {
            $push: {
              status: '$status',
              count: 1
            }
          }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobDetails'
        }
      },
      {
        $unwind: '$jobDetails'
      }
    ]);
    
    res.json({
      totalApplications,
      statusBreakdown: stats,
      jobStats
    });
  } catch (err) {
    console.error('Error fetching application stats:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get applications for current student
exports.getMyApplications = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const applications = await Application.find({ student: studentId })
      .populate('job', 'title company location')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (err) {
    console.error('Error fetching student applications:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get single application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findById(applicationId)
      .populate('job', 'title company description requirements')
      .populate('student', 'name email phone course year branch resume');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Check if user has permission to view this application
    if (req.user.role === 'student' && application.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(application);
  } catch (err) {
    console.error('Error fetching application:', err);
    res.status(500).json({ error: err.message });
  }
};

