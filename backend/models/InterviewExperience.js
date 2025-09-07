const mongoose = require('mongoose');

const interviewExperienceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  package: { type: String },
  experience: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  rounds: [{ type: String }],
  tips: { type: String },
  approved: { type: Boolean, default: false },
  submittedBy: { type: String, required: true }, // Student name
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
