import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, DollarSign, Clock, Building, User, Award } from 'lucide-react';
import './jobs.css';
import { API_ENDPOINTS } from '../config/api';

// Utility function for logo URL handling
// Utility function for logo URL handling - Use static assets
// Utility function for logo URL handling - SIMPLIFIED
// Utility function for logo URL handling - FIXED
const getCompanyLogoUrl = (logoPath) => {
  if (!logoPath) return `${API_ENDPOINTS.UPLOADS}/default-logo.png`;
  
  // If it's already a full URL (Cloudinary or external)
  if (logoPath.startsWith('http')) return logoPath;
  
  // If it's a path starting with /assets/ (faculty images)
  if (logoPath.startsWith('/assets/')) {
    return `${API_ENDPOINTS.UPLOADS}${logoPath}`;
  }
  
  // If it's a path starting with /uploads/ (uploaded company logos)
  if (logoPath.startsWith('/uploads/')) {
    return `${API_ENDPOINTS.UPLOADS}${logoPath}`;
  }
  
  // If it's just a filename, assume it's in assets/faculties folder
  return `${API_ENDPOINTS.UPLOADS}/assets/faculties/${logoPath}`;
};
// JobCard Component
const JobCard = ({ job, onClick }) => {
  console.log('Job data in JobCard:', job); // Debug log
  
  // Use the utility function for logo URL
  const logoUrl = getCompanyLogoUrl(job.companyLogo);
  console.log('Logo URL:', logoUrl); // Debug log

  const skills = job.skillsRequired ? job.skillsRequired.split(',').map(s => s.trim()) : [];

  return (
    <div className="job-card" onClick={() => onClick(job)}>
      <div className="job-card-content">
        <div className="job-card-header">
          <img 
            src={logoUrl} 
            alt={`${job.companyName} logo`} 
            className="company-logo"
            onError={(e) => {
              console.error('Failed to load logo:', logoUrl);
              e.target.src = '/default-logo.png'; // Fallback if image fails to load
            }}
          />
          <div className="company-name">{job.companyName}</div>
        </div>
        
        <div className="job-details-container">
          <div className="job-position">{job.position}</div>
          
          <div className="job-info-row">
            <div className="job-info-item">
              <MapPin className="detail-icon" size={16} />
              <span className="job-location">{job.location}</span>
            </div>
            <div className="job-info-item">
              <Clock className="detail-icon" size={16} />
              <span>{job.jobType}</span>
            </div>
          </div>
          <div className="job-info-row">
            <div className="job-salary">
              <DollarSign className="detail-icon" size={16} style={{display: 'inline', marginRight: '4px'}} />
              {job.salaryPackage}
            </div>
          </div>
          
          {/* Eligibility Information Section */}
          <div className="job-eligibility-section">
            {(job.eligibleCourses && job.eligibleCourses.length > 0) ||
             (job.eligibleYears && job.eligibleYears.length > 0) ||
             (job.eligibleBranches && job.eligibleBranches.length > 0) ? (
              <>
                {job.eligibleCourses && job.eligibleCourses.length > 0 && (
                  <div className="eligibility-row">
                    <Award className="detail-icon" size={14} />
                    <span className="job-eligible-courses">
                      <strong>Courses:</strong> {Array.isArray(job.eligibleCourses) 
                        ? job.eligibleCourses.join(", ") 
                        : job.eligibleCourses}
                    </span>
                  </div>
                )}
                
                {job.eligibleYears && job.eligibleYears.length > 0 && (
                  <div className="eligibility-row">
                    <span className="job-eligible-years">
                      <strong>Years:</strong> {Array.isArray(job.eligibleYears) 
                        ? job.eligibleYears.join(", ") 
                        : job.eligibleYears}
                    </span>
                  </div>
                )}
                
                {job.eligibleBranches && job.eligibleBranches.length > 0 && (
                  <div className="eligibility-row">
                    <span className="job-eligible-branches">
                      <strong>Branches:</strong> {Array.isArray(job.eligibleBranches) 
                        ? job.eligibleBranches.join(", ") 
                        : job.eligibleBranches}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="eligibility-row">
                <span className="job-eligible-courses">
                  <strong>Eligibility:</strong> Check job details
                </span>
              </div>
            )}
          </div>
        </div>
        
        {job.skillsRequired && (
          <div className="job-skills">
            <div className="skills-label">Required Skills</div>
            <div className="skills-tags">
              {skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="skill-tag">+{skills.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// JobDetails Component
const JobDetails = ({ job, onBack, onApply }) => {
  if (!job) return null;
  
  // Use the utility function for logo URL
  const logoUrl = getCompanyLogoUrl(job.companyLogo);

  const skills = job.skillsRequired ? job.skillsRequired.split(',').map(s => s.trim()) : [];
  const benefits = job.benefits ? job.benefits.split(',').map(s => s.trim()) : [];

  return (
    <div className="job-details-container">
      <button className="back-button" onClick={onBack}>
        <span className="back-arrow">←</span> Back to Jobs
      </button>
      <div className="job-details-header">        <img 
          src={logoUrl} 
          alt={`${job.companyName} logo`} 
          className="details-logo"
          onError={(e) => {
            console.error('Failed to load logo:', logoUrl);
            e.target.src = '/default-logo.png'; // Fallback if image fails to load
          }}
        />
        <div className="header-content">
          <h1>{job.position}</h1>
          <h2>{job.companyName}</h2>          <div className="job-meta">
            <span className="meta-item location">📍 {job.location}</span>
            <span className="meta-item salary">Rs. {job.salaryPackage}</span>
            <span className="meta-item type">🕒 {job.jobType}</span>
          </div>
        </div>
      </div><div className="job-details-content">        <div className="job-section">
          <h3>Eligibility Criteria</h3>
          <div className="eligibility-grid">
            {job.eligibleCourses && job.eligibleCourses.length > 0 && (
              <div className="eligibility-item">
                <strong>Eligible Courses:</strong>
                <div className="eligibility-tags">
                  {(Array.isArray(job.eligibleCourses) ? job.eligibleCourses : [job.eligibleCourses]).map((course, index) => (
                    <span key={index} className="eligibility-tag course-tag">{course}</span>
                  ))}
                </div>
              </div>
            )}
            
            {job.eligibleYears && job.eligibleYears.length > 0 && (
              <div className="eligibility-item">
                <strong>Eligible Years:</strong>
                <div className="eligibility-tags">
                  {(Array.isArray(job.eligibleYears) ? job.eligibleYears : [job.eligibleYears]).map((year, index) => (
                    <span key={index} className="eligibility-tag year-tag">{year}</span>
                  ))}
                </div>
              </div>
            )}
            
            {job.eligibleBranches && job.eligibleBranches.length > 0 && (
              <div className="eligibility-item">
                <strong>Eligible Branches:</strong>
                <div className="eligibility-tags">
                  {(Array.isArray(job.eligibleBranches) ? job.eligibleBranches : [job.eligibleBranches]).map((branch, index) => (
                    <span key={index} className="eligibility-tag branch-tag">{branch}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="job-section">
          <h3>Job Description</h3>
          <p>{job.jobDescription || 'No job description provided.'}</p>
        </div>        <div className="job-section">
          <h3>Requirements</h3>
          <ul className="requirements-list">
            <li className="requirement-item">
              <span className="bullet">•</span> Check eligibility criteria above for course, year, and branch requirements
            </li>
            <li className="requirement-item">
              <span className="bullet">•</span> Good academic record and relevant skills as mentioned
            </li>
          </ul>
        </div>
        {skills.length > 0 && (
          <div className="job-section">
            <h3>Skills</h3>
            <div className="skills-container">
              {skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
        <div className="job-section">
          <h3>Benefits</h3>
          <ul className="benefits-list">
            {benefits.length > 0 ? benefits.map((benefit, index) => (
              <li key={index} className="benefit-item">
                <span className="bullet">•</span> {benefit}
              </li>
            )) : (
              <li className="benefit-item">
                <span className="bullet">•</span> Benefits information not provided.
              </li>
            )}
          </ul>
        </div>        {job.companyWebsite ? (
          <a 
            href={job.companyWebsite} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="apply-button"
          >
            Apply Now
          </a>
        ) : (
          <button className="apply-button" onClick={() => onApply && onApply(job)}>
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

// Main Jobs Component
const Jobs = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.JOBS);
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const jobsData = await response.json();
        console.log('Fetched jobs data:', jobsData); // Debug log
        setJobs(jobsData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const handleBack = () => {
    setSelectedJob(null);
  };

  const handleApply = (job) => {
    alert(`Applied for ${job.position} at ${job.companyName}`);
  };

  if (loading) {
    return (
      <div className="jobs-page-container">
        <div className="loading-container">
          <h2>Loading jobs...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jobs-page-container">
        <div className="error-container">
          <h2>Error loading jobs</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-page-container">
      {!selectedJob ? (
        <div>
          <div className="jobs-header">
            <h1 className="jobs-title">Available Jobs</h1>
            <p className="jobs-subtitle">{jobs.length} job(s) available</p>
          </div>
          <div className="jobs-list">
            {jobs.length === 0 ? (
              <div className="no-jobs-container">
                <h3>No jobs available at the moment</h3>
                <p>Please check back later for new opportunities.</p>
              </div>
            ) : (
              jobs.map((job) => (
                <JobCard key={job._id} job={job} onClick={handleJobClick} />
              ))
            )}
          </div>
        </div>
      ) : (
        <JobDetails 
          job={selectedJob} 
          onBack={handleBack} 
          onApply={handleApply} 
        />
      )}
    </div>
  );
};

export default Jobs;