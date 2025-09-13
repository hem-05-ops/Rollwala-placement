const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rollNo: { type: String, required: true, unique: true, trim: true },
    course: { type: String, required: true, enum: ['BSc.CS', 'MSc.CS', 'MSc.AIML', 'MCA'] },
    branch: { type: String, required: true, enum: ['WD', 'AIML'] },
    year: { type: String, required: true, enum: ['1st', '2nd', '3rd', '4th', '5th'] },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    resume: { type: String },
    contact: { type: String, required: true },
    skills: [{ type: String }],
    projects: [{ type: String }], // Changed from complex object to simple array
    certifications: [{ type: String }],
    achievements: [{ type: String }],
    linkedin: { type: String },
    github: { type: String },
    profilePicture: { type: String }
  },
  { timestamps: true }
);

// Add a pre-save hook to handle updates without required fields
studentSchema.pre('findOneAndUpdate', function(next) {
  this.options.runValidators = false; // Disable validation for updates
  next();
});

module.exports = mongoose.model('Student', studentSchema);