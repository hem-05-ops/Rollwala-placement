const Student = require('../models/Student');
const User = require('../models/User');

// Get all pending students (not yet approved)
exports.getPendingStudents = async (req, res) => {
  try {
    const students = await Student.find({ isApproved: false })
      .populate('user', 'firstName lastName email role');

    return res.json(students);
  } catch (error) {
    console.error('Get pending students error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve a student by ID
exports.approveStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).populate('user', 'firstName lastName email role');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.isApproved) {
      return res.status(400).json({ error: 'Student is already approved' });
    }

    student.isApproved = true;
    await student.save();

    return res.json({ message: 'Student approved successfully', student });
  } catch (error) {
    console.error('Approve student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel a student registration request by ID (delete student and linked user)
exports.cancelStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete linked user as well so the cancelled account cannot be used
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }

    await Student.findByIdAndDelete(id);

    return res.json({ message: 'Student registration request cancelled and account removed.' });
  } catch (error) {
    console.error('Cancel student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
