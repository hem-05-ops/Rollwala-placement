const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyName: String,
  companyLogo: String,
  companyWebsite: String,  // Add company website field
  position: String,
  jobType: String,
  salaryPackage: String,
  location: String,
  applicationDeadline: String,
  jobDescription: String,
  jobDescriptionFile: String,
  skillsRequired: String,
  selectionProcess: String,
  bondDetails: String,
  benefits: String,
  contactPerson: String,
  contactEmail: String,
  contactPhone: String,
  driveDate: String,
  additionalInfo: String,
  eligibleCourses: [String],
  eligibleSemesters: [Number],
  eligibleYears: [String],
  eligibleBranches: [String],
  eligibleTracks: [String],
  courseEligibility: [{
    course: String,
    semesters: [Number]
  }],
  minCgpa: { type: Number, default: 0, min: 0, max: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);