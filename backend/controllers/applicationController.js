// backend/controllers/applicationController.js
const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');
const User = require('../models/User');
const { sendBulkEmail } = require('../services/emailService');
// Note: exceljs is lazily required inside the export handler to avoid boot-time crashes if missing

// ─── Shared eligibility helper ───────────────────────────────────────────────
const runEligibilityCheck = (job, student) => {
  const reasons = [];

  // 1. Granular Course-Semester check (Priority)
  if (Array.isArray(job.courseEligibility) && job.courseEligibility.length > 0) {
    const courseMatch = job.courseEligibility.find(ce => ce.course === student.course);
    if (!courseMatch) {
      reasons.push({
        criterion: 'Course',
        required: job.courseEligibility.map(ce => ce.course).join(', '),
        yours: student.course || 'Not set'
      });
    } else {
      // Course matches, check semesters for THIS course
      if (Array.isArray(courseMatch.semesters) && courseMatch.semesters.length > 0) {
        if (!courseMatch.semesters.includes(Number(student.semester))) {
          reasons.push({
            criterion: 'Semester',
            extra: `Specifically for ${student.course}`,
            required: courseMatch.semesters.join(', '),
            yours: student.semester || 'Not set'
          });
        }
      }
    }
  } else {
    // Fallback to Legacy fields
    // Legacy Course check
    if (Array.isArray(job.eligibleCourses) && job.eligibleCourses.length > 0) {
      if (!job.eligibleCourses.includes(student.course)) {
        reasons.push({
          criterion: 'Course',
          required: job.eligibleCourses.join(', '),
          yours: student.course || 'Not set'
        });
      }
    }
    // Legacy Semester check
    if (Array.isArray(job.eligibleSemesters) && job.eligibleSemesters.length > 0) {
      if (!job.eligibleSemesters.includes(Number(student.semester))) {
        reasons.push({
          criterion: 'Semester',
          required: job.eligibleSemesters.join(', '),
          yours: student.semester || 'Not set'
        });
      }
    }
  }

  // 2. Branch check
  if (Array.isArray(job.eligibleBranches) && job.eligibleBranches.length > 0) {
    if (!job.eligibleBranches.includes(student.branch)) {
      reasons.push({
        criterion: 'Branch',
        required: job.eligibleBranches.join(', '),
        yours: student.branch || 'Not set'
      });
    }
  }

  // 3. CGPA check
  const minCgpa = typeof job.minCgpa === 'number' ? job.minCgpa : 0;
  if (minCgpa > 0) {
    const studentCgpa = typeof student.cgpa === 'number' ? student.cgpa : 0;
    if (studentCgpa < minCgpa) {
      reasons.push({
        criterion: 'CGPA',
        required: minCgpa,
        yours: studentCgpa
      });
    }
  }

  return { eligible: reasons.length === 0, reasons };
};
// ─────────────────────────────────────────────────────────────────────────────

// Get applications with optional filters (admin only)
exports.getApplications = async (req, res) => {
  try {
    const { company, jobId } = req.query;

    const filter = {};

    // If jobId is provided (backward compatibility with existing UI)
    if (jobId && jobId !== 'all') {
      filter.job = jobId;
    }

    // If company filter provided, resolve matching jobs first
    if (company && typeof company === 'string' && company.trim().length > 0) {
      const companyRegex = new RegExp(company.trim(), 'i');
      const jobs = await Job.find({ companyName: companyRegex }).select('_id');
      const jobIds = jobs.map(j => j._id);
      // If no jobs match, return empty list early
      if (jobIds.length === 0) {
        return res.json([]);
      }
      filter.job = filter.job ? filter.job : { $in: jobIds };
      if (filter.job && filter.job.$in) {
        // If both jobId and company are provided, ensure intersection
        filter.job = { $in: jobIds, ...(jobId && jobId !== 'all' ? { $eq: jobId } : {}) };
      }
    }

    const applications = await Application.find(filter)
      .populate('job', 'position title companyName campusType location')
      .populate('student', 'name email contact course semester branch resume')
      .sort({ appliedAt: -1 });

    return res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Submit a job application
exports.submitApplication = async (req, res) => {
  try {
    const { jobId, formResponses, applicantData } = req.body;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Parse studentId — support string or object sent from frontend
    let studentId = req.body.studentId;
    if (!studentId || typeof studentId === 'object') {
      // Fallback: look up student by applicantEmail
      if (applicantData?.applicantEmail) {
        const user = await User.findOne({ email: applicantData.applicantEmail });
        if (user) {
          const found = await Student.findOne({ user: user._id });
          studentId = found?._id;
        }
      }
    }

    let student = null;
    if (studentId) {
      student = await Student.findById(studentId);
      if (!student) {
        student = await Student.findOne({ user: studentId });
      }
    }
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found. Please log in as a student.' });
    }

    // ── Eligibility check (hard-block ineligible students) ──────────────────
    const eligibility = runEligibilityCheck(job, student);
    if (!eligibility.eligible) {
      return res.status(403).json({
        error: 'You are not eligible to apply for this job.',
        eligible: false,
        reasons: eligibility.reasons
      });
    }
    // ────────────────────────────────────────────────────────────────────────
    
    // Check if student already applied for this job
    const existingApplication = await Application.findOne({
      job: jobId,
      student: student._id
    });
    
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }
    
    // Create new application
    const application = new Application({
      job: jobId,
      student: student._id,
      applicantName: applicantData?.applicantName || `${student.firstName} ${student.lastName}`,
      applicantEmail: applicantData?.applicantEmail,
      applicantPhone: applicantData?.applicantPhone || student.contact,
      applicantCourse: applicantData?.applicantCourse || student.course,
      applicantSemester: applicantData?.applicantSemester || student.semester,
      applicantBranch: applicantData?.applicantBranch || student.branch,
      formResponses
    });
    
    await application.save();
    
    // Populate the saved application for response
    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'position companyName')
      .populate('student', 'firstName lastName course semester branch');
    
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

// Pre-check eligibility for a student before they apply
exports.checkEligibility = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { studentId } = req.query;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    let student = null;
    if (studentId) {
      // First try to find by Student ID directly
      student = await Student.findById(studentId);
      // If not found, the frontend might have passed the User._id by mistake/design
      if (!student) {
        student = await Student.findOne({ user: studentId });
      }
    }
    if (!student) {
      // Return job eligibility criteria without student-specific check
      return res.json({
        eligible: null,
        notLoggedIn: true,
        criteria: {
          eligibleCourses: job.eligibleCourses || [],
          eligibleBranches: job.eligibleBranches || [],
          eligibleSemesters: job.eligibleSemesters || [],
          minCgpa: job.minCgpa || 0
        }
      });
    }

    const result = runEligibilityCheck(job, student);
    return res.json({
      ...result,
      studentProfile: {
        course: student.course,
        branch: student.branch,
        semester: student.semester,
        cgpa: student.cgpa
      },
      criteria: {
        eligibleCourses: job.eligibleCourses || [],
        eligibleBranches: job.eligibleBranches || [],
        eligibleSemesters: job.eligibleSemesters || [],
        minCgpa: job.minCgpa || 0
      }
    });
  } catch (err) {
    console.error('Error checking eligibility:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all applications for a specific job (admin only)
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const applications = await Application.find({ job: jobId })
      .populate('job', 'position title companyName campusType location')
      .populate('student', 'name email phone course semester branch resume')
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
      .populate('job', 'position title companyName campusType location')
      .populate('student', 'name email phone course semester branch resume')
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
    .populate('job', 'position title companyName campusType location')
    .populate('student', 'name email phone course semester branch resume');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Send email notification to student when status changes to shortlisted or selected
    try {
      const targetStatuses = ['shortlisted', 'selected'];
      if (status && targetStatuses.includes(status.toLowerCase())) {
        // Prefer application-level contact info (set at apply time),
        // fall back to populated student fields if needed
        const studentEmail = application.applicantEmail || application.student?.email;
        const studentName = application.applicantName || application.student?.name || 'Student';
        const jobTitle = application.job?.position || application.job?.title || 'the position';
        const companyName = application.job?.companyName || 'the company';

        if (studentEmail) {
          const isSelected = status.toLowerCase() === 'selected';
          const subject = isSelected
            ? `Congratulations! You have been selected for ${jobTitle} at ${companyName}`
            : `You have been shortlisted for ${jobTitle} at ${companyName}`;

          const statusText = isSelected ? 'SELECTED' : 'SHORTLISTED';

          const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Status Update</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <div style="background:linear-gradient(135deg,#1e40af 0%,#2563eb 100%);padding:24px 20px;text-align:center;border-radius:8px 8px 0 0;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;">Department of Computer Science</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:13px;">Gujarat University</p>
    </div>
    <div style="padding:24px 20px;">
      <p style="color:#111827;font-size:16px;">Dear ${studentName},</p>
      <p style="color:#374151;font-size:14px;line-height:1.6;">
        Your application status for the role <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated to:
      </p>
      <p style="text-align:center;margin:20px 0;">
        <span style="display:inline-block;padding:10px 18px;border-radius:999px;background-color:${isSelected ? '#16a34a' : '#2563eb'};color:#ffffff;font-weight:bold;font-size:14px;letter-spacing:0.03em;">
          ${statusText}
        </span>
      </p>
      ${adminNotes ? `<p style="color:#374151;font-size:14px;line-height:1.6;"><strong>Message from the placement team:</strong><br/>${adminNotes}</p>` : ''}
      <p style="color:#4b5563;font-size:13px;line-height:1.6;">
        Please log in to the Campus Recruitment Portal to see more details about your application.
      </p>
      <div style="text-align:center;margin-top:24px;">
        <a href="#" style="display:inline-block;padding:10px 20px;border-radius:6px;background-color:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;">Open Student Dashboard</a>
      </div>
      <p style="color:#6b7280;font-size:12px;margin-top:24px;">
        This is an automated notification from the Department of Computer Science Placement Portal.
      </p>
    </div>
  </div>
</body>
</html>`;

          // Fire and forget; log errors but don't fail the API if email sending has issues
          sendBulkEmail([studentEmail], subject, html)
            .then(summary => {
              console.log('[ApplicationStatusEmail] Delivery summary:', summary);
            })
            .catch(emailErr => {
              console.error('[ApplicationStatusEmail] Failed to send email:', emailErr?.message || emailErr);
            });
        }
      }
    } catch (notifyErr) {
      console.error('Error sending status update email:', notifyErr?.message || notifyErr);
      // Do not throw; status update itself succeeded
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
      .populate('student', 'name email phone course semester branch resume');
    
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

// Export applications to Excel (admin only)
exports.exportApplicationsExcel = async (req, res) => {
  try {
    let ExcelJS;
    try {
      // Lazy require so server can start even if exceljs is missing
      // and we can return a helpful error instead of crashing.
      // eslint-disable-next-line global-require
      ExcelJS = require('exceljs');
    } catch (modErr) {
      return res.status(500).json({
        error: 'Excel export is unavailable. Please install the "exceljs" dependency.',
        install: 'Run: npm install exceljs',
      });
    }
    // Fetch all applications with related job and student data
    const applications = await Application.find()
      .populate('job', 'position companyName')
      .populate('student', 'course semester branch resume')
      .sort({ appliedAt: -1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applications');

    // Define columns (including resume path)
    worksheet.columns = [
      { header: 'Student Name', key: 'studentName', width: 28 },
      { header: 'Student Email', key: 'studentEmail', width: 30 },
      { header: 'Course', key: 'course', width: 16 },
      { header: 'Semester', key: 'semester', width: 12 },
      { header: 'Branch', key: 'branch', width: 14 },
      { header: 'Resume Path', key: 'resume', width: 40 },
      { header: 'Job Title / Position', key: 'position', width: 28 },
      { header: 'Company Name', key: 'companyName', width: 28 },
      { header: 'Application Date', key: 'appliedAt', width: 22 },
      { header: 'Application Status', key: 'status', width: 20 },
      { header: 'Interview Date', key: 'interviewDate', width: 22 },
      { header: 'Admin Notes', key: 'adminNotes', width: 40 }
    ];

    // Add rows
    applications.forEach(app => {
      worksheet.addRow({
        studentName: app.applicantName || (app.student && app.student.name) || '',
        studentEmail: app.applicantEmail || (app.student && app.student.email) || '',
        course: app.applicantCourse || (app.student && app.student.course) || '',
        semester: app.applicantSemester || (app.student && app.student.semester) || '',
        branch: app.applicantBranch || (app.student && app.student.branch) || '',
        resume: app.resume || (app.student && app.student.resume) || '',
        position: app.job && (app.job.title || app.job.position) ? (app.job.title || app.job.position) : '',
        companyName: app.job && app.job.companyName ? app.job.companyName : '',
        appliedAt: app.appliedAt ? new Date(app.appliedAt).toLocaleString() : '',
        status: app.status || '',
        interviewDate: app.interviewDate ? new Date(app.interviewDate).toLocaleString() : '',
        adminNotes: app.adminNotes || ''
      });
    });

    // Set header styles (bold)
    worksheet.getRow(1).font = { bold: true };

    // Prepare response headers
    const fileName = `applications_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exporting applications:', err);
    res.status(500).json({ error: 'Failed to export applications' });
  }
};

