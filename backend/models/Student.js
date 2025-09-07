const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rollNo: { type: String, required: true, unique: true, trim: true },
    course: { type: String, required: true, enum: ['BSc.CS', 'MSc.CS', 'MSc.AIML', 'MCA'] },
    branch: { type: String, required: true, enum: ['WD', 'AIML'] },
    year: { type: String, required: true, enum: ['1st', '2nd', '3rd', '4th', '5th'] },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    resume: { type: String }, // File path to uploaded resume
    contact: { type: String, required: true },
    skills: [{ type: String }],
    projects: [{
      name: { type: String, required: true },
      description: { type: String },
      technology: { type: String },
      status: { type: String, enum: ['Completed', 'In Progress', 'Planned'], default: 'Planned' },
      link: { type: String }
    }],
    certifications: [{ type: String }],
    achievements: [{ type: String }],
    linkedin: { type: String },
    github: { type: String },
    profilePicture: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);