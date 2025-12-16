const Job = require('../models/Job');
const Student = require('../models/Student');
const { sendBulkEmail, testEmailConnection } = require('../services/emailService');

exports.getAllJobs = async (req, res) => {
  try {
    console.log('Fetching all jobs...'); // Debug log
    const jobs = await Job.find();
    console.log(`Found ${jobs.length} jobs`); // Debug log
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Failed to fetch jobs', details: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    console.log('📝 Creating new job...');
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files || 'No files uploaded');
    
    const jobData = { ...req.body };
    
    // Handle array fields that come as individual form fields (from FormData)
    if (jobData['eligibleCourses[]']) {
      jobData.eligibleCourses = Array.isArray(jobData['eligibleCourses[]']) 
        ? jobData['eligibleCourses[]'] 
        : [jobData['eligibleCourses[]']];
      delete jobData['eligibleCourses[]'];
    }
    
    if (jobData['eligibleBranches[]']) {
      jobData.eligibleBranches = Array.isArray(jobData['eligibleBranches[]']) 
        ? jobData['eligibleBranches[]'] 
        : [jobData['eligibleBranches[]']];
      delete jobData['eligibleBranches[]'];
    }
    
    if (jobData['eligibleYears[]']) {
      jobData.eligibleYears = Array.isArray(jobData['eligibleYears[]']) 
        ? jobData['eligibleYears[]'] 
        : [jobData['eligibleYears[]']];
      delete jobData['eligibleYears[]'];
    }
    
    // Ensure arrays exist even if empty
    if (!jobData.eligibleCourses) jobData.eligibleCourses = [];
    if (!jobData.eligibleBranches) jobData.eligibleBranches = [];
    if (!jobData.eligibleYears) jobData.eligibleYears = [];
    
    // Normalize optional multi-fields (forward compat)
    if (jobData['jobTypes[]']) {
      jobData.jobTypes = Array.isArray(jobData['jobTypes[]']) ? jobData['jobTypes[]'] : [jobData['jobTypes[]']];
      delete jobData['jobTypes[]'];
    }
    if (jobData['positions[]']) {
      jobData.positions = Array.isArray(jobData['positions[]']) ? jobData['positions[]'] : [jobData['positions[]']];
      delete jobData['positions[]'];
    }

    // Handle file uploads - local storage only
    // When using multer.any(), req.files is an array. Normalize to a keyed object.
    let files = req.files || {};
    if (Array.isArray(files)) {
      const byField = {};
      files.forEach((f) => {
        if (!byField[f.fieldname]) byField[f.fieldname] = [];
        byField[f.fieldname].push(f);
      });
      files = byField;
    }
    const logoFile = Array.isArray(files.companyLogo) ? files.companyLogo[0] : null;
    const jdFile = Array.isArray(files.jobDescriptionFile) ? files.jobDescriptionFile[0] : null;

    if (logoFile) {
      jobData.companyLogo = `/uploads/${logoFile.filename}`;
      console.log('✅ Logo uploaded locally:', jobData.companyLogo);
    } else {
      console.log('ℹ️ No logo uploaded for this job');
      if (jobData.companyLogo && typeof jobData.companyLogo !== 'string') {
        delete jobData.companyLogo;
      }
    }

    if (jdFile) {
      jobData.jobDescriptionFile = `/uploads/job_descriptions/${jdFile.filename}`;
      console.log('✅ Job description file uploaded:', jobData.jobDescriptionFile);
    } else {
      console.log('ℹ️ No job description file uploaded for this job');
    }
    
    console.log('Processed job data:', jobData);
    
    const job = new Job(jobData);
    await job.save();
    console.log('✅ Job created successfully:', job._id);
    
    // Attempt to notify eligible students via email (non-blocking for response)
    (async () => {
      try {
        console.log('[notify] Starting email notification process...');
        
        // First, test if email service is configured
        const emailReady = await testEmailConnection();
        if (!emailReady) {
          console.log('[notify] Email service not configured, skipping notifications');
          return;
        }

        const totalStudents = await Student.countDocuments({});
        const distinctCourses = await Student.distinct('course');
        const distinctBranches = await Student.distinct('branch');
        const distinctYears = await Student.distinct('year');
        console.log(`[notify] Total students: ${totalStudents}`);
        console.log(`[notify] Distinct courses: ${JSON.stringify(distinctCourses)}`);
        console.log(`[notify] Distinct branches: ${JSON.stringify(distinctBranches)}`);
        console.log(`[notify] Distinct years: ${JSON.stringify(distinctYears)}`);

        const criteria = {};
        if (Array.isArray(job.eligibleCourses) && job.eligibleCourses.length > 0) {
          criteria.course = { $in: job.eligibleCourses };
        }
        if (Array.isArray(job.eligibleBranches) && job.eligibleBranches.length > 0) {
          criteria.branch = { $in: job.eligibleBranches };
        }
        let yearFilterApplied = false;
        let providedYears = Array.isArray(job.eligibleYears) ? job.eligibleYears : [];
        if (providedYears.length > 0) {
          const allowedYears = ['1st', '2nd', '3rd', '4th', '5th'];
          const normalizedYears = providedYears.filter((y) => allowedYears.includes(y));
          if (normalizedYears.length > 0) {
            criteria.year = { $in: normalizedYears };
            yearFilterApplied = true;
          }
        }

        console.log('[notify] Eligibility criteria:', JSON.stringify(criteria));
        let students = await Student.find(criteria).populate('user', 'email');
        // Fallback: if no match AND a non-standard year (e.g., 2026) was provided, retry without year filter
        if (students.length === 0 && providedYears.length > 0 && !yearFilterApplied) {
          const { year, ...withoutYear } = criteria;
          console.log('[notify] No students matched with provided years. Retrying without year filter...');
          students = await Student.find(withoutYear).populate('user', 'email');
        }
        console.log(`[notify] Matched students: ${students.length}`);
        const emails = students
          .map((s) => (s.user && s.user.email ? s.user.email : null))
          .filter(Boolean);

        console.log(`[notify] Valid emails found: ${emails.length}`);

        if (emails.length > 0) {
          const subject = `New Placement Opportunity: ${job.companyName} - ${job.position || 'Various Positions'}`;
          const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; }
                .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
                .job-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .button { display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Department of Computer Science</h1>
                  <p>Gujarat University - Placement Cell</p>
                </div>
                <div class="content">
                  <h2>New Placement Opportunity!</h2>
                  <p>Dear Student,</p>
                  <p>A new company has been added to the placement portal that matches your profile.</p>
                  
                  <div class="job-details">
                    <h3>${job.companyName}</h3>
                    <p><strong>Position:</strong> ${job.position || 'Multiple Positions'}</p>
                    <p><strong>Job Type:</strong> ${job.jobType || 'Not specified'}</p>
                    <p><strong>Location:</strong> ${job.location || 'Not specified'}</p>
                    <p><strong>Application Deadline:</strong> ${job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'Not specified'}</p>
                    ${job.description ? `<p><strong>Description:</strong> ${job.description}</p>` : ''}
                  </div>
                  
                  <p>Don't miss this opportunity! Log in to the placement portal to view complete details and apply.</p>
                  
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="#" class="button">View Job Details</a>
                  </div>
                  
                  <p><strong>Eligibility Criteria:</strong></p>
                  <ul>
                    ${job.eligibleCourses && job.eligibleCourses.length > 0 ? `<li>Courses: ${job.eligibleCourses.join(', ')}</li>` : ''}
                    ${job.eligibleBranches && job.eligibleBranches.length > 0 ? `<li>Branches: ${job.eligibleBranches.join(', ')}</li>` : ''}
                    ${job.eligibleYears && job.eligibleYears.length > 0 ? `<li>Years: ${job.eligibleYears.join(', ')}</li>` : ''}
                  </ul>
                </div>
                <div class="footer">
                  <p>This is an automated notification from the Placement Cell, Department of Computer Science, Gujarat University.</p>
                  <p>Please do not reply to this email. If you have any questions, contact the placement cell directly.</p>
                  <p>&copy; ${new Date().getFullYear()} Department of Computer Science, Gujarat University. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>`;

          try {
            console.log(`[notify] Sending notifications to ${emails.length} students...`);
            const summary = await sendBulkEmail(emails, subject, html);
            console.log(`[notify] ✅ Email delivery completed: sent=${summary.sent} failed=${summary.failed}`);
            
            if (summary.failed > 0) {
              console.log('[notify] Failed deliveries:', summary.failures);
            }
          } catch (emailError) {
            console.error('[notify] ❌ Email sending failed:', emailError.message);
          }
        } else {
          console.log('ℹ️ No matching students found for eligibility criteria; no emails sent.');
          // Debug: Check sample students
          const sample = await Student.find({}).limit(3).populate('user', 'email');
          const sampleEmails = sample.map(s => s?.user?.email).filter(Boolean);
          console.log('[notify] Sample student emails for debugging:', sampleEmails);
        }
      } catch (notifyErr) {
        console.error('[notify] ❌ Notification process error:', notifyErr.message);
        console.error(notifyErr);
      }
    })();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: job
    });
  } catch (err) {
    console.error('❌ Error creating job:', err);
    res.status(500).json({ 
      error: 'Failed to create job', 
      details: err.message 
    });
  }
};

exports.updateJob = async (req, res) => {
  try {
    console.log('Update request body:', req.body); // Debug log
    console.log('Uploaded files (update):', req.files || 'No files uploaded');
    const jobData = { ...req.body };
    
    // Handle array fields that come as individual form fields
    if (jobData['eligibleCourses[]']) {
      jobData.eligibleCourses = Array.isArray(jobData['eligibleCourses[]']) 
        ? jobData['eligibleCourses[]'] 
        : [jobData['eligibleCourses[]']];
      delete jobData['eligibleCourses[]'];
    }
    
    if (jobData['eligibleBranches[]']) {
      jobData.eligibleBranches = Array.isArray(jobData['eligibleBranches[]']) 
        ? jobData['eligibleBranches[]'] 
        : [jobData['eligibleBranches[]']];
      delete jobData['eligibleBranches[]'];
    }
    
    if (jobData['eligibleYears[]']) {
      jobData.eligibleYears = Array.isArray(jobData['eligibleYears[]']) 
        ? jobData['eligibleYears[]'] 
        : [jobData['eligibleYears[]']];
      delete jobData['eligibleYears[]'];
    }
    
    // Ensure arrays exist even if empty
    if (!jobData.eligibleCourses) jobData.eligibleCourses = [];
    if (!jobData.eligibleBranches) jobData.eligibleBranches = [];
    if (!jobData.eligibleYears) jobData.eligibleYears = [];
    
    // Handle file uploads for update - normalize req.files when using multer.any()
    let files = req.files || {};
    if (Array.isArray(files)) {
      const byField = {};
      files.forEach((f) => {
        if (!byField[f.fieldname]) byField[f.fieldname] = [];
        byField[f.fieldname].push(f);
      });
      files = byField;
    }
    const logoFile = Array.isArray(files.companyLogo) ? files.companyLogo[0] : null;
    const jdFile = Array.isArray(files.jobDescriptionFile) ? files.jobDescriptionFile[0] : null;

    if (logoFile) {
      jobData.companyLogo = `/uploads/${logoFile.filename}`;
      console.log('✅ Logo updated locally:', jobData.companyLogo);
    }

    if (jdFile) {
      jobData.jobDescriptionFile = `/uploads/job_descriptions/${jdFile.filename}`;
      console.log('✅ Job description file updated:', jobData.jobDescriptionFile);
    }
    
    console.log('Processed update data:', jobData); // Debug log
    
    const job = await Job.findByIdAndUpdate(req.params.id, jobData, { new: true });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    console.log('Updated job:', job); // Debug log
    res.json({
      success: true,
      message: 'Job updated successfully',
      job: job
    });
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).json({ error: 'Failed to update job', details: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    console.log('Deleting job:', req.params.id); // Debug log
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    console.log('Job deleted successfully'); // Debug log
    res.json({ 
      success: true, 
      message: 'Job deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).json({ error: 'Failed to delete job', details: err.message });
  }
};

// Additional helper function to test email for a specific job
exports.testJobEmail = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Test email configuration
    const emailReady = await testEmailConnection();
    if (!emailReady) {
      return res.status(400).json({ 
        error: 'Email service not configured properly',
        details: 'Check your .env file and email credentials'
      });
    }

    // Send test email to a single address (your own)
    const testEmail = process.env.EMAIL_USERNAME;
    if (!testEmail) {
      return res.status(400).json({ 
        error: 'No test email configured',
        details: 'Set EMAIL_USERNAME in your .env file'
      });
    }

    const subject = `TEST: New Placement Opportunity - ${job.companyName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2 style="color: #1e40af;">TEST EMAIL: New Company Added</h2>
        <p>This is a test email for job notifications.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px;">
          <h3>${job.companyName}</h3>
          <p><strong>Position:</strong> ${job.position || 'N/A'}</p>
          <p><strong>Location:</strong> ${job.location || 'N/A'}</p>
        </div>
        <p><em>If you receive this email, your email service is working correctly.</em></p>
      </div>`;

    const summary = await sendBulkEmail([testEmail], subject, html);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      testEmail: testEmail,
      delivery: summary
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email', 
      details: error.message 
    });
  }
};