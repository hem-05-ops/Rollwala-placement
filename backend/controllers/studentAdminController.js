const Student = require('../models/Student');
const User = require('../models/User');

// Get all pending students (not yet approved)
// Uses $ne: true to catch students where isApproved is false, null, undefined,
// or the field is missing — not just strict false equality.
exports.getPendingStudents = async (req, res) => {
  try {
    const students = await Student.find({ isApproved: { $ne: true } })
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

    // Use findByIdAndUpdate with runValidators:false to avoid full-document
    // validation failures on existing records that may have missing/enum-mismatched
    // optional fields (e.g. branch, track). Using .save() would run all validators
    // and could silently fail to persist the approval.
    const updated = await Student.findByIdAndUpdate(
      id,
      { $set: { isApproved: true } },
      { new: true, runValidators: false }
    ).populate('user', 'firstName lastName email role');

    return res.json({ message: 'Student approved successfully', student: updated });
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

// Bulk approve all students that are stuck (isApproved is not true)
// Useful for fixing students who were approved via the old buggy .save() path
// and are now invisible to the pending list but still blocked from login.
exports.bulkApproveStuck = async (req, res) => {
  try {
    const result = await Student.updateMany(
      { isApproved: { $ne: true } },
      { $set: { isApproved: true } },
      { runValidators: false }
    );

    return res.json({
      message: `Bulk approval complete. ${result.modifiedCount} student(s) approved.`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk approve error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
