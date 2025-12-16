import React, { useState, useEffect } from 'react';
import './AdminJobPosting.css';
import { API_ENDPOINTS } from '../config/api';
import AdminHeader from './AdminHeader';
import { getAllJobs, createJob, updateJob, deleteJob } from '../../api/jobs';

const initialForm = {
  companyName: '',
  companyLogo: '',
  companyWebsite: '',
  position: '',
  positions: [],
  jobType: 'Full-time',
  jobTypes: [],
  salaryPackage: '',
  location: '',
  applicationDeadline: '',
  jobDescription: '',
  skillsRequired: '',
  selectionProcess: '',
  bondDetails: '',
  benefits: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  driveDate: '',
  additionalInfo: '',
  eligibleCourses: [],
  eligibleBranches: [],
  eligibleYears: []
};

// Add these arrays for dropdown options
const COURSES = ['BSc.CS', 'MSc.CS', 'MSc.AIML', 'MCA'];
const BRANCHES = ['WD', 'AIML'];
const YEARS = [ '2024', '2025', '2026', '2027'];
const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'];

const AdminJobPosting = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [adminRole, setAdminRole] = useState(() => {
    try {
      const raw = localStorage.getItem('adminUser');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.role || '';
    } catch {
      return '';
    }
  });
  const [newTitle, setNewTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(jobPostings.length / pageSize));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [jobPostings, currentPage]);

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobs = await getAllJobs();
        setJobPostings(jobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Error loading job postings');
      }
    };
    fetchJobs();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  // Toggle job type checkbox selection
  const handleJobTypeToggle = (type) => {
    const current = Array.isArray(formData.jobTypes) ? formData.jobTypes : [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setFormData({ ...formData, jobTypes: updated });
  };
  // Handle checkbox change for multiple selections
  const handleCheckboxChange = (field, value) => {
    const currentValues = formData[field] || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    setFormData({
      ...formData,
      [field]: updatedValues
    });
  };

  // Handle select all/clear all for multiple selections
  const handleSelectAll = (field, options) => {
    const currentValues = formData[field] || [];
    const allSelected = options.every(option => currentValues.includes(option));
    
    setFormData({
      ...formData,
      [field]: allSelected ? [] : options
    });
  };

  const handleLogoUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    setLogoPreview(URL.createObjectURL(file));
    setLogoFile(file);
    
    // Also update the formData with the filename for consistency
    setFormData(prev => ({
      ...prev,
      companyLogo: file.name // Store the filename
    }));
  }
}; 

  const handleJobDescriptionFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setJobDescriptionFile(null);
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, DOC, or DOCX files are allowed for Job Description.');
      setJobDescriptionFile(null);
      e.target.value = '';
      return;
    }

    setJobDescriptionFile(file);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('Form submit - editId:', editId);
    console.log('Form submit - formData:', formData);
    
    // Validate required fields
    if (formData.eligibleCourses.length === 0) {
      setError('Please select at least one eligible course.');
      return;
    }
    if (formData.eligibleYears.length === 0) {
      setError('Please select at least one eligible year.');
      return;
    }
    if (!editId && !jobDescriptionFile) {
      setError('Please upload a Job Description file (PDF/DOC/DOCX).');
      return;
    }
    
    try {
      let job;
      // Normalize fields
      const normalizedJobTypes = Array.isArray(formData.jobTypes) ? formData.jobTypes : (formData.jobType ? [formData.jobType] : []);
      const normalizedJobType = normalizedJobTypes.length ? normalizedJobTypes.join(', ') : '';
      const normalizedPositions = Array.isArray(formData.positions) && formData.positions.length
        ? formData.positions
        : (formData.position ? [formData.position] : []);
      const normalizedPosition = normalizedPositions[0] || '';

      // Build multipart form data for backend (multer expects file fields 'companyLogo' and 'jobDescriptionFile')
      const fd = new FormData();
      fd.append('companyName', formData.companyName || '');
      fd.append('companyWebsite', formData.companyWebsite || '');
      fd.append('position', normalizedPosition);
      fd.append('jobType', normalizedJobType);
      fd.append('salaryPackage', formData.salaryPackage || '');
      fd.append('location', formData.location || '');
      fd.append('applicationDeadline', formData.applicationDeadline || '');
      fd.append('jobDescription', formData.jobDescription || '');
      fd.append('skillsRequired', formData.skillsRequired || '');
      fd.append('selectionProcess', formData.selectionProcess || '');
      fd.append('bondDetails', formData.bondDetails || '');
      fd.append('benefits', formData.benefits || '');
      fd.append('contactPerson', formData.contactPerson || '');
      fd.append('contactEmail', formData.contactEmail || '');
      fd.append('contactPhone', formData.contactPhone || '');
      fd.append('driveDate', formData.driveDate || '');
      fd.append('additionalInfo', formData.additionalInfo || '');

      // Arrays: use bracketed names to match backend parser
      (formData.eligibleCourses || []).forEach(v => fd.append('eligibleCourses[]', v));
      (formData.eligibleBranches || []).forEach(v => fd.append('eligibleBranches[]', v));
      (formData.eligibleYears || []).forEach(v => fd.append('eligibleYears[]', v));
      // Also send multi fields for future compatibility (ignored by current backend if not handled)
      normalizedJobTypes.forEach(v => fd.append('jobTypes[]', v));
      normalizedPositions.forEach(v => fd.append('positions[]', v));

      // Files
      if (logoFile) fd.append('companyLogo', logoFile);
      if (jobDescriptionFile) fd.append('jobDescriptionFile', jobDescriptionFile);

      if (editId) {
        job = await updateJob(editId, fd);
        setJobPostings(jobPostings.map(j => j._id === editId ? job : j));
        setSuccess('Job updated successfully!');
        setActiveTab('manage');
      } else {
        job = await createJob(fd);
        setJobPostings([...jobPostings, job]);
        setSuccess('Job created successfully!');
      }
      
      setEditId(null);
      setFormData(initialForm);
      setLogoPreview('');
      setLogoFile(null);
      setJobDescriptionFile(null);
    } catch (error) {
      console.error('Error saving job:', error);
      setError('Error saving job. Please try again.');
    }
  };
  const handleSuccess = (job) => {
    console.log('handleSuccess called with:', job); // Debug log
    
    if (editId) {
      setJobPostings(jobPostings.map(j => j._id === editId ? job : j));
      setSuccess('Job updated successfully!');
      setActiveTab('manage'); // Switch back to manage tab after edit
    } else {
      setJobPostings([...jobPostings, job]);
      setSuccess('Job created successfully!');
    }
    
    setEditId(null);
    setFormData(initialForm);
    setLogoPreview('');
    setLogoFile(null);
  };

  const handleError = (err) => {
    console.error('Error saving job:', err);
    setError('Error saving job. Please try again.');
  };
  const handleEdit = (job) => {
    console.log('Editing job:', job); // Debug log
    
    // Ensure arrays are properly handled
    const editFormData = {
      ...job,
      positions: Array.isArray(job.positions)
        ? job.positions
        : (typeof job.position === 'string' && job.position.length
            ? [job.position]
            : []),
      eligibleCourses: Array.isArray(job.eligibleCourses) ? job.eligibleCourses : [],
      eligibleBranches: Array.isArray(job.eligibleBranches) ? job.eligibleBranches : [],
      eligibleYears: Array.isArray(job.eligibleYears) ? job.eligibleYears : [],
      jobTypes: Array.isArray(job.jobTypes)
        ? job.jobTypes
        : (typeof job.jobType === 'string' && job.jobType.length
            ? job.jobType.split(',').map(s => s.trim()).filter(Boolean)
            : []),
    };
    
    console.log('Form data for edit:', editFormData); // Debug log
    
    setFormData(editFormData);
    setEditId(job._id);
    setActiveTab('create');
    
    // Handle logo preview
    if (job.companyLogo) {
      const logo = (job.companyLogo || '').trim();
      const isAbsolute = /^https?:\/\//i.test(logo) || logo.startsWith('/');
      setLogoPreview(isAbsolute ? logo : `${API_ENDPOINTS.UPLOADS}${logo}`);
    } else {
      setLogoPreview('');
    }
    setLogoFile(null);
  };

  const handleDelete = async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobPostings(jobPostings.filter(job => job._id !== jobId));
      alert('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job. Please try again.');
    }
  };
  const handleCancel = () => {
    console.log('Cancel button clicked'); // Debug log
    setEditId(null);
    setFormData(initialForm);
    setLogoPreview('');
    setLogoFile(null);
    setActiveTab('manage');
  };
  // Handle tab changes
  const handleTabChange = (tab) => {
    if (tab === 'manage' && editId) {
      // If switching to manage tab while editing, reset edit state
      setEditId(null);
      setFormData(initialForm);
      setLogoPreview('');
      setLogoFile(null);
    }
    setActiveTab(tab);
  };

 // Replace this function in your AdminJobPosting.js:
const getLogoSrc = (posting) => {
  if (!posting?.companyLogo) return '';
  const logo = (posting.companyLogo || '').trim();
  
  // Already absolute (Cloudinary/external)
  if (logo.startsWith('http')) return logo;
  
  // Any root-relative path like /assets/... or /uploads/...
  if (logo.startsWith('/')) return `${API_ENDPOINTS.UPLOADS}${logo}`;
  
  // Plain filename -> assume it's in uploads directory
  return `${API_ENDPOINTS.UPLOADS}/uploads/${logo}`;
};

const getJobDescriptionUrl = (posting) => {
  if (!posting?.jobDescriptionFile) return '';
  const jd = (posting.jobDescriptionFile || '').trim();

  if (jd.startsWith('http')) return jd;
  if (jd.startsWith('/')) return `${API_ENDPOINTS.UPLOADS}${jd}`;

  return `${API_ENDPOINTS.UPLOADS}/uploads/job_descriptions/${jd}`;
};

  const addJobTitle = () => {
    const title = (newTitle || '').trim();
    if (!title) return;
    const current = Array.isArray(formData.positions) ? formData.positions : [];
    if (current.includes(title)) return;
    setFormData({ ...formData, positions: [...current, title] });
    setNewTitle('');
  };

  const removeJobTitle = (title) => {
    const current = Array.isArray(formData.positions) ? formData.positions : [];
    setFormData({ ...formData, positions: current.filter(t => t !== title) });
  };
// const logoUrl = getCompanyLogoUrl(job.companyLogo);
  return (
    <>
      <AdminHeader />
      <div className="admin-job-posting-container">
      <div className="admin-content">
        <h1>Job Posting Management</h1>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-800 shadow-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-300 px-4 py-3 text-sm text-green-800 shadow-sm">
            {success}
          </div>
        )}
        <div className="admin-tabs" role="tablist" aria-label="Job posting management tabs">
          <button
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => handleTabChange('create')}
            role="tab"
            aria-selected={activeTab === 'create'}
            aria-controls="create-tabpanel"
            id="create-tab"
          >
            {editId ? 'Edit Job Posting' : 'Create New Job Posting'}
          </button>
          <button
            className={activeTab === 'manage' ? 'active' : ''}
            onClick={() => handleTabChange('manage')}
            role="tab"
            aria-selected={activeTab === 'manage'}
            aria-controls="manage-tabpanel"
            id="manage-tab"
          >
            Manage Job Postings
          </button>
        </div>

        {activeTab === 'create' ? (
          <form onSubmit={handleSubmit} className="job-posting-form" encType="multipart/form-data" role="tabpanel" aria-labelledby="create-tab" id="create-tabpanel">
            <div className="form-section">
              <h2>Company Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name*</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Company Logo</label>
                  <div className="logo-upload">
                    {logoPreview && (<img src={logoPreview} alt="Company Logo Preview" className="logo-preview" />)}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Company Website</label>
                  <input type="url" name="companyWebsite" value={formData.companyWebsite} onChange={handleInputChange} placeholder="https://www.company.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Person*</label>
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Contact Email*</label>
                  <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Job Description</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Upload Job Description (PDF/DOCX)*</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleJobDescriptionFileChange}
                    required={!editId}
                  />
                  <small className="hint-text">Accepted formats: PDF, DOC, DOCX.</small>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Job Details</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Position Title*</label>
                  {(adminRole === 'admin' || adminRole === 'super_admin') ? (
                    <div>
                      <div className="multi-title-row">
                        <input type="text" placeholder="Add job title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                        <button type="button" className="add-btn" onClick={addJobTitle}>Add</button>
                      </div>
                      {Array.isArray(formData.positions) && formData.positions.length > 0 && (
                        <div className="chips">
                          {formData.positions.map(t => (
                            <span key={t} className="chip">
                              {t}
                              <button type="button" className="chip-close" onClick={() => removeJobTitle(t)}>×</button>
                            </span>
                          ))}
                        </div>
                      )}
                      <input type="hidden" name="position" value={formData.positions?.[0] || ''} readOnly />
                    </div>
                  ) : (
                    <input type="text" name="position" value={formData.position} onChange={handleInputChange} required />
                  )}
                </div>
                <div className="form-group">
                  <label>Job Type*</label>
                  {(adminRole === 'admin' || adminRole === 'super_admin') ? (
                    <div className="checkbox-grid">
                      {JOB_TYPES.map(t => (
                        <label key={t} className="checkbox-item">
                          <input type="checkbox" checked={Array.isArray(formData.jobTypes) && formData.jobTypes.includes(t)} onChange={() => handleJobTypeToggle(t)} />
                          <span className="checkbox-label">{t}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <select name="jobType" value={formData.jobType} onChange={handleInputChange} required>
                      {JOB_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Salary Package*</label>
                  <input type="text" name="salaryPackage" value={formData.salaryPackage} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Location*</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Drive Date</label>
                  <input type="date" name="driveDate" value={formData.driveDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Application Deadline*</label>
                  <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleInputChange} required />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Job Requirements</h2>
              <div className="form-group">
                <label>Job Description*</label>
                <textarea name="jobDescription" value={formData.jobDescription} onChange={handleInputChange} required rows="5" />
              </div>
            </div>

            <div className="form-section">
              <h2>Eligibility Details</h2>
              <div className="form-row">
                <div className="form-group">
                  <div className="eligibility-header">
                    <label>Eligible Courses*</label>
                    <div className="selection-controls">
                      <button type="button" className="select-all-btn" onClick={() => handleSelectAll('eligibleCourses', COURSES)}>
                        {formData.eligibleCourses.length === COURSES.length ? 'Clear All' : 'Select All'}
                      </button>
                    </div>
                  </div>
                  <div className="checkbox-grid">
                    {COURSES.map(course => (
                      <label key={course} className="checkbox-item">
                        <input type="checkbox" checked={formData.eligibleCourses.includes(course)} onChange={() => handleCheckboxChange('eligibleCourses', course)} />
                        <span className="checkbox-label">{course}</span>
                      </label>
                    ))}
                  </div>
                  {formData.eligibleCourses.length > 0 && (
                    <div className="selected-items">
                      <span className="selected-label">Selected: </span>
                      {formData.eligibleCourses.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="eligibility-header">
                    <label>Eligible Track (for technical courses)</label>
                    <div className="selection-controls">
                      <button type="button" className="select-all-btn" onClick={() => handleSelectAll('eligibleBranches', BRANCHES)}>
                        {formData.eligibleBranches.length === BRANCHES.length ? 'Clear All' : 'Select All'}
                      </button>
                    </div>
                  </div>
                  <div className="checkbox-grid">
                    {BRANCHES.map(branch => (
                      <label key={branch} className="checkbox-item">
                        <input type="checkbox" checked={formData.eligibleBranches.includes(branch)} onChange={() => handleCheckboxChange('eligibleBranches', branch)} />
                        <span className="checkbox-label">{branch}</span>
                      </label>
                    ))}
                  </div>
                  {formData.eligibleBranches.length > 0 && (
                    <div className="selected-items">
                      <span className="selected-label">Selected: </span>
                      {formData.eligibleBranches.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="eligibility-header">
                    <label>Eligible Years*</label>
                    <div className="selection-controls">
                      <button type="button" className="select-all-btn" onClick={() => handleSelectAll('eligibleYears', YEARS)}>
                        {formData.eligibleYears.length === YEARS.length ? 'Clear All' : 'Select All'}
                      </button>
                    </div>
                  </div>
                  <div className="checkbox-grid">
                    {YEARS.map(year => (
                      <label key={year} className="checkbox-item">
                        <input type="checkbox" checked={formData.eligibleYears.includes(year)} onChange={() => handleCheckboxChange('eligibleYears', year)} />
                        <span className="checkbox-label">{year}</span>
                      </label>
                    ))}
                  </div>
                  {formData.eligibleYears.length > 0 && (
                    <div className="selected-items">
                      <span className="selected-label">Selected: </span>
                      {formData.eligibleYears.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Skills Required*</label>
              <textarea name="skillsRequired" value={formData.skillsRequired} onChange={handleInputChange} required rows="3" placeholder="Enter skills separated by commas" />
            </div>

            <div className="form-section">
              <h2>Additional Information</h2>
              <div className="form-group">
                <label>Selection Process</label>
                <textarea name="selectionProcess" value={formData.selectionProcess} onChange={handleInputChange} rows="3" placeholder="e.g., Written Test, Technical Interview, HR Round" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bond Details (if any)</label>
                  <input type="text" name="bondDetails" value={formData.bondDetails} onChange={handleInputChange} placeholder="e.g., 1 year bond with Rs. 50,000 penalty" />
                </div>
                <div className="form-group">
                  <label>Benefits</label>
                  <input type="text" name="benefits" value={formData.benefits} onChange={handleInputChange} placeholder="e.g., Health insurance, PF, etc." />
                </div>
              </div>
              <div className="form-group">
                <label>Additional Information</label>
                <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} rows="3" />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">{editId ? 'Update Job Posting' : 'Create Job Posting'}</button>
              {editId && (
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
              )}
            </div>
          </form>
        ) : (
<div className="job-postings-list" role="tabpanel" aria-labelledby="manage-tab" id="manage-tabpanel">
  <h2 aria-live="polite">Manage Job Postings ({jobPostings.length})</h2>
  {jobPostings.length === 0 ? (
    <div className="no-postings">
      <p>No job postings created yet.</p>
    </div>
  ) : (
    <div className="table-responsive" style={{ overflowX: 'auto' }}>
      <table>
      <thead>
        <tr>
          <th>Company</th>
          <th>Position</th>
          <th>Job Type</th>
          <th>Package</th>
          <th>Eligible Courses</th>
          <th>Eligible Years</th>
          <th>Deadline</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {(jobPostings.slice((currentPage - 1) * pageSize, currentPage * pageSize)).map((posting) => (
          <tr key={posting._id}>
           <td>
              <div className="company-cell">
                {posting.companyLogo && (
                  <img 
                    src={getLogoSrc(posting)}
                    alt={posting.companyName}
                    className="company-logo-small"
                    onError={(e) => {
                      console.error('Failed to load logo:', getLogoSrc(posting));
                      e.target.src = `${API_ENDPOINTS.UPLOADS}/assets/faculties/bg-logo.png`;
                      e.target.onerror = null;
                    }}
                  />
                )}
                <span className="company-name">{posting.companyName}</span>
              </div>
            </td>
            <td>
              {Array.isArray(posting.positions) && posting.positions.length
                ? posting.positions.join(', ')
                : (posting.position || '-')}
            </td>
            <td>{Array.isArray(posting.jobTypes) && posting.jobTypes.length ? posting.jobTypes.join(', ') : (posting.jobType || '-')}</td>
            <td>{posting.salaryPackage || '-'}</td>
            <td>
              {(posting.eligibleCourses?.join(', ') || 'None')}
              {posting.eligibleBranches?.length > 0 && (
                <span> ({posting.eligibleBranches.join(', ')})</span>
              )}
            </td>
            <td>{posting.eligibleYears?.join(', ') || '-'}</td>
            <td>
              {posting.applicationDeadline 
                ? new Date(posting.applicationDeadline).toLocaleDateString() 
                : '-'}
            </td>
            <td>
              <div className="action-buttons">
                {posting.jobDescriptionFile && (
                  <button
                    type="button"
                    className="edit-btn view-jd-btn"
                    onClick={() => {
                      const url = getJobDescriptionUrl(posting);
                      if (url) window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    View JD
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleEdit(posting)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this job posting?')) {
                      handleDelete(posting._id);
                    }
                  }}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  )}
  {jobPostings.length > pageSize && (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        Prev
      </button>
      {Array.from({ length: Math.ceil(jobPostings.length / pageSize) }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          className={`page-btn ${currentPage === n ? 'active' : ''}`}
          onClick={() => setCurrentPage(n)}
          aria-current={currentPage === n ? 'page' : undefined}
        >
          {n}
        </button>
      ))}
      <button
        className="page-btn"
        onClick={() => setCurrentPage(p => Math.min(Math.ceil(jobPostings.length / pageSize), p + 1))}
        disabled={currentPage === Math.ceil(jobPostings.length / pageSize)}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  )}
</div>
)}
</div>
</div>
</>
);
};

export default AdminJobPosting;