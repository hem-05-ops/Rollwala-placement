const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true, trim: true },
  course: { type: String, required: true, enum: ['BSc.CS', 'MSc.CS', 'MSc.AIML', 'MCA'] },
  // Branch is only required at business logic level for MSc.CS; allow null/undefined in DB
  branch: { type: String, enum: ['WD', 'AIML'], required: false },
  track: { type: String, enum: ['.NET', 'Java', 'Data Science', 'Python', 'Web Development', 'Other'], required: false },
  year: { type: String, required: true, enum: ['1st', '2nd', '3rd', '4th', '5th'] },
  // CGPA can be filled later; default to 0
  cgpa: { type: Number, min: 0, max: 10, default: 0, required: false },
  resume: { type: String },
  contact: { type: String, required: true },
  skills: [{ type: String }],
  projects: [{ type: String }],
  certifications: [{ type: String }],
  achievements: [{ type: String }],
  linkedin: { type: String },
  github: { type: String },
  profilePicture: { type: String },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

// Add a pre-save hook to handle updates without required fields
studentSchema.pre('findOneAndUpdate', function(next) {
  this.options.runValidators = false; // Disable validation for updates
  next();
});

module.exports = mongoose.model('Student', studentSchema);