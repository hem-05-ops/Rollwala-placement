import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Building, User, Award, IndianRupee } from 'lucide-react';
import './jobs.css';
import { API_ENDPOINTS } from '../config/api';

// Utility: build absolute logo URL against backend base
const getCompanyLogoUrl = (logoPath) => {
  // Default fallback to a known asset served by backend
  if (!logoPath) return `${API_ENDPOINTS.UPLOADS}/assets/faculties/bg-logo.png`;

  // Already absolute (Cloudinary/external)
  if (logoPath.startsWith('http')) return logoPath;

  // Any root-relative path like /assets/... or /uploads/...
  if (logoPath.startsWith('/')) return `${API_ENDPOINTS.UPLOADS}${logoPath}`;

  // Plain filename -> assume it lives under assets/faculties
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
              e.target.src = `${API_ENDPOINTS.UPLOADS}/assets/faculties/bg-logo.png`; // Backend-served fallback
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
            <div className="job-salary" style={{ display: 'flex', alignItems: 'center' }}>
              <IndianRupee className="detail-icon" size={16} style={{ marginRight: '4px' }} />
              {job.salaryPackage}
            </div>
          </div>
          
          {/* Eligibility Information Section */}
          <div className="job-eligibility-section">
            {(job.eligibleCourses && job.eligibleCourses.length > 0) ||
             (job.eligibleSemesters && job.eligibleSemesters.length > 0) ||
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
                
                {job.eligibleSemesters && job.eligibleSemesters.length > 0 && (
                  <div className="eligibility-row">
                    <span className="job-eligible-years">
                      <strong>Semesters:</strong> {Array.isArray(job.eligibleSemesters) 
                        ? job.eligibleSemesters.join(", ") 
                        : job.eligibleSemesters}
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
                {job.minCgpa > 0 && (
                  <span className="job-eligible-courses" style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                    Min CGPA: {job.minCgpa}
                  </span>
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
  const [eligibility, setEligibility] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        const token = localStorage.getItem('authToken');
        let query = '';
        if (token) {
          // If the student is authenticated, we assume they have a studentId in localStorage
          // or the backend will inspect their token. Since the backend checks `studentId` query param
          // or uses the `req.user`, we'll pass the studentId from localStorage if we have it.
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              if (u.studentId) query = `?studentId=${u.studentId}`;
              else if (u.id) query = `?studentId=${u.id}`;
            } catch (e) {}
          }
        }
        
        // We call the new endpoint (even without token it will return abstract job criteria)
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_ENDPOINTS.JOBS.replace('/jobs', '/applications')}/eligibility/${job._id}${query}`, {
          headers
        });
        
        if (res.ok) {
          const data = await res.json();
          setEligibility(data);
        } else {
          setEligibility(null);
        }
      } catch (err) {
        console.error('Error checking eligibility', err);
        setEligibility(null);
      } finally {
        setChecking(false);
      }
    };

    if (job?._id) fetchEligibility();
  }, [job]);

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
            e.target.src = `${API_ENDPOINTS.UPLOADS}/assets/faculties/bg-logo.png`; // Backend-served fallback
          }}
        />
        <div className="header-content">
          <h1>{job.position}</h1>
          <h2>{job.companyName}</h2>          <div className="job-meta" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '10px' }}>
            <span className="meta-item location" style={{ display: 'flex', alignItems: 'center' }}>
              <MapPin size={18} style={{ marginRight: '6px' }} />
              {job.location}
            </span>
            <span className="meta-item salary" style={{ display: 'flex', alignItems: 'center' }}>
              <IndianRupee size={18} style={{ marginRight: '6px' }} />
              {job.salaryPackage}
            </span>
            <span className="meta-item type" style={{ display: 'flex', alignItems: 'center' }}>
              <Clock size={18} style={{ marginRight: '6px' }} />
              {job.jobType}
            </span>
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
            
            {job.eligibleSemesters && job.eligibleSemesters.length > 0 && (
              <div className="eligibility-item">
                <strong>Eligible Semesters:</strong>
                <div className="eligibility-tags">
                  {(Array.isArray(job.eligibleSemesters) ? job.eligibleSemesters : [job.eligibleSemesters]).map((sem, index) => (
                    <span key={index} className="eligibility-tag year-tag">Sem {sem}</span>
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

            {job.minCgpa > 0 && (
              <div className="eligibility-item" style={{ width: '100%', gridColumn: 'span 2' }}>
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
                  <Award className="detail-icon" size={18} style={{ color: '#16a34a' }} />
                  <span style={{ color: '#166534', fontWeight: '600' }}>
                    Minimum CGPA Required: {job.minCgpa}
                  </span>
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
        </div>       

        <div className="job-section" style={{ marginTop: '30px', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
          <h3>Application Status</h3>
          {checking ? (
             <div style={{ color: '#6b7280', fontStyle: 'italic' }}>Checking eligibility...</div>
          ) : eligibility?.notLoggedIn ? (
             <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '15px', borderRadius: '8px', color: '#92400e' }}>
               <p style={{ margin: 0, fontWeight: 'bold' }}>Please log in to apply.</p>
               <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>You must be a registered student to check eligibility and submit an application.</p>
             </div>
          ) : (
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#111827' }}>Eligibility Check</h4>
              
              {/* Display reasons if ineligible */}
              {eligibility?.eligible === false && eligibility?.reasons?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: '#b91c1c', fontWeight: 'bold', margin: '0 0 10px 0' }}>❌ You do not meet all criteria:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151' }}>
                    {eligibility.reasons.map((r, i) => (
                      <li key={i} style={{ marginBottom: '6px' }}>
                        <strong>{r.criterion}:</strong> Required {r.required}, but your profile has {r.yours}.
                      </li>
                    ))}
                  </ul>
                  <p style={{ margin: '10px 0 0 0', fontSize: '0.85em', color: '#6b7280' }}>
                    Update your profile if this information is incorrect.
                  </p>
                </div>
              )}

              {/* Display success if eligible */}
              {eligibility?.eligible === true && (
                <div style={{ marginBottom: '20px', color: '#166534', backgroundColor: '#dcfce3', padding: '10px 15px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✅ You are eligible for this position!
                  </p>
                </div>
              )}

              <div style={{ marginTop: '20px' }}>
                {job.companyWebsite ? (
                  <a 
                    href={job.companyWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="apply-button"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    Apply on Company Website
                  </a>
                ) : eligibility?.eligible === false ? (
                  <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '1.1em', marginTop: '10px', padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #f87171', borderRadius: '6px', textAlign: 'center' }}>
                    You are not eligible to apply
                  </div>
                ) : (
                  <button 
                    className="apply-button" 
                    onClick={() => onApply && onApply(job)}
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
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

  const handleApply = async (job) => {
    try {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        alert('Please log in to apply.');
        return;
      }

      let parsedUser;
      try {
        parsedUser = JSON.parse(userStr);
      } catch (e) {
        alert('Invalid user session. Please log in again.');
        return;
      }

      const studentId = parsedUser.studentId || parsedUser.id;

      const response = await fetch(`${API_ENDPOINTS.JOBS.replace('/jobs', '/applications')}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: job._id,
          studentId: studentId
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully applied for ${job.position} at ${job.companyName}!`);
        // We could also re-trigger eligibility check here so the UI updates to "Already Applied"
      } else {
        alert(`Failed to apply: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Apply error:', err);
      alert('An error occurred while submitting your application.');
    }
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