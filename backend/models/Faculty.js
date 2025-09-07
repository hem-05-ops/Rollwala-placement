const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    designation: { type: String, required: true },
    contactNum: { type: String, required: true },
    department: { type: String, required: true },
    specialization: { type: String },
    experience: { type: Number }, // Years of experience
    profilePicture: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faculty', facultySchema);