const InterviewExperience = require('../models/InterviewExperience');
const Student = require('../models/Student');

// Submit interview experience (Student only)
exports.submitInterviewExperience = async (req, res) => {
  try {
    const { company, role, package, experience, difficulty, rounds, tips } = req.body;
    
    // Get student info
    const student = await Student.findOne({ user: req.user.id }).populate('user');
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const interviewExp = new InterviewExperience({
      student: student._id,
      company,
      role,
      package,
      experience,
      difficulty,
      rounds: rounds || [],
      tips,
      submittedBy: student.user.name
    });

    await interviewExp.save();

    res.status(201).json({
      message: 'Interview experience submitted successfully! It will be reviewed by admin.',
      experience: interviewExp
    });
  } catch (error) {
    console.error('Submit interview experience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all approved interview experiences (Public)
exports.getAllApprovedExperiences = async (req, res) => {
  try {
    const experiences = await InterviewExperience.find({ approved: true })
      .populate('student', 'course branch year')
      .sort({ createdAt: -1 });

    res.json(experiences);
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all interview experiences (Admin only)
exports.getAllExperiences = async (req, res) => {
  try {
    const experiences = await InterviewExperience.find()
      .populate('student', 'course branch year rollNo')
      .sort({ createdAt: -1 });

    res.json(experiences);
  } catch (error) {
    console.error('Get all experiences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve/Reject interview experience (Admin only)
exports.updateExperienceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const experience = await InterviewExperience.findByIdAndUpdate(
      id,
      { approved },
      { new: true }
    );

    if (!experience) {
      return res.status(404).json({ error: 'Interview experience not found' });
    }

    res.json({
      message: `Interview experience ${approved ? 'approved' : 'rejected'} successfully`,
      experience
    });
  } catch (error) {
    console.error('Update experience status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete interview experience (Admin only)
exports.deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await InterviewExperience.findByIdAndDelete(id);

    if (!experience) {
      return res.status(404).json({ error: 'Interview experience not found' });
    }

    res.json({ message: 'Interview experience deleted successfully' });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Legacy function for backward compatibility
exports.addExperience = exports.submitInterviewExperience;
exports.getExperienceById = async (req, res) => {
  try {
    const exp = await InterviewExperience.findById(req.params.id)
      .populate('student', 'course branch year rollNo');
    if (!exp) return res.status(404).json({ error: 'Not found' });
    res.json(exp);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
