import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../lib/apiService';
import AdminHeader from './AdminHeader';
import * as XLSX from 'xlsx';
import './ApplicationManagement.css';
import { API_ENDPOINTS } from '../config/api';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [stats, setStats] = useState({
    totalApplications: 0,
    statusBreakdown: []
  });
  const [exporting, setExporting] = useState(false);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const listTopRef = useRef(null);

  const COURSES = ['BSc.CS', 'MSc.CS', 'MSc.AIML', 'MCA'];
  const SEMESTERS_BY_COURSE = {
    'BSc.CS': [1, 2, 3, 4, 5, 6],
    'MSc.CS': [1, 2, 3, 4],
    'MSc.AIML': [1, 2, 3, 4],
    'MCA': [1, 2, 3, 4]
  };
  const semesterOptions = filterCourse !== 'all' ? (SEMESTERS_BY_COURSE[filterCourse] || []) : [];

  // Fetch all applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const url = selectedJob === 'all' 
        ? '/api/applications/all'
        : `/api/applications/job/${selectedJob}`;
      const data = await api.get(url, { requireAuth: true });
      setApplications(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Error fetching applications');
      console.error('Fetch applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs for filter dropdown
  const fetchJobs = async () => {
    try {
      const data = await api.get('/api/jobs');
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const data = await api.get('/api/applications/stats', { requireAuth: true });
      setStats({
        totalApplications: data.totalApplications || 0,
        statusBreakdown: data.statusBreakdown || []
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Update application status
  const updateApplicationStatus = async (applicationId, status, adminNotes) => {
    try {
      const result = await api.put(`/api/applications/${applicationId}/status`, { status, adminNotes }, { requireAuth: true });
      if (result) {
        setSuccess('Application status updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
        fetchApplications();
        fetchStats();
      }
    } catch (err) {
      setError('Error updating application status');
      console.error('Update status error:', err);
    }
  };

  // Export applications to Excel
  const exportToExcel = async () => {
    try {
      setExporting(true);
      
      // Prepare data for export — use filtered data (by job/course/semester)
      const dataToExport = filteredApplications.map(app => {
        // Resolve job information from populated object or fallback to jobs list by id
        const jobRef = app.job;
        let jobInfo = null;
        if (jobRef && typeof jobRef === 'object') {
          jobInfo = jobRef;
          if (!jobInfo.position && !jobInfo.companyName && jobInfo._id) {
            const byId = jobs.find(j => j._id === jobInfo._id);
            if (byId) jobInfo = byId;
          }
        } else if (jobRef) {
          jobInfo = jobs.find(j => j._id === jobRef) || {};
        } else {
          jobInfo = {};
        }

        // Extract form responses as a single string
        const formResponses = app.formResponses 
          ? app.formResponses.map(resp => 
              `${resp.fieldLabel}: ${Array.isArray(resp.response) ? resp.response.join(', ') : resp.response || 'Not provided'}`
            ).join('; ')
          : '';
        
        return {
          'Applicant Name': app.applicantName || 'N/A',
          'Email': app.applicantEmail || 'N/A',
          'Phone': app.applicantPhone || 'N/A',
          'Course': app.applicantCourse || 'N/A',
          'Semester': app.applicantSemester || 'N/A',
          'Track': app.applicantBranch || 'N/A',
          'Resume Path': app.resume || (app.student?.resume || ''),
          'Status': app.status || 'pending',
          'Applied Date': app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US') : 'N/A',
          'Position': jobInfo?.position || jobInfo?.title || 'N/A',
          'Company': jobInfo?.companyName || 'N/A',
          'Job Type': jobInfo?.jobType || 'N/A',
          'Form Responses': formResponses,
          'Admin Notes': app.adminNotes || ''
        };
      });
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications');
      
      // Generate file name with current date
      const fileName = `Applications_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Export to Excel
      XLSX.writeFile(wb, fileName);
      
      setSuccess('Data exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error exporting data to Excel');
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      shortlisted: '#3498db',
      interviewed: '#9b59b6',
      selected: '#27ae60',
      rejected: '#e74c3c'
    };
    return colors[status?.toLowerCase()] || '#95a5a6';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      shortlisted: '📋',
      interviewed: '👥',
      selected: '✅',
      rejected: '❌'
    };
    return icons[status?.toLowerCase()] || '❓';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle admin notes change
  const handleAdminNotesChange = (applicationId, notes) => {
    const updatedApplications = applications.map(app => 
      app._id === applicationId 
        ? { ...app, adminNotes: notes }
        : app
    );
    setApplications(updatedApplications);
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Initial data fetch
  useEffect(() => {
    fetchJobs();
    fetchStats();
    fetchApplications();
  }, []);

  // Fetch applications when selectedJob changes
  useEffect(() => {
    setCurrentPage(1);
    fetchApplications();
  }, [selectedJob]);

  // Reset semester when course changes
  useEffect(() => {
    setFilterSemester('all');
    setCurrentPage(1);
  }, [filterCourse]);

  // Reset page when course/semester filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSemester]);

  // Clear messages when they exist
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Derived: apply course + semester filters client-side (computed before pagination clamp)
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const courseMatch = filterCourse === 'all' || app.applicantCourse === filterCourse;
      const semesterMatch = filterSemester === 'all' || String(app.applicantSemester) === String(filterSemester);
      return courseMatch && semesterMatch;
    });
  }, [applications, filterCourse, filterSemester]);

  // Clamp current page if data size changes
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [filteredApplications, pageSize, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const paginatedApplications = filteredApplications.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredApplications.length);

  // Scroll to top of list on page change
  useEffect(() => {
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="application-management-container">
          <div className="loading">Loading applications...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="application-management-container">
      
      <div className="application-management-header">
        <h1>📋 Application Management</h1>
        <div className="header-actions">
          <button 
            onClick={exportToExcel} 
            disabled={exporting || filteredApplications.length === 0}
            className="export-btn"
          >
            {exporting ? 'Exporting...' : '📊 Export to Excel'}
          </button>
        </div>
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-number">{stats.totalApplications}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          {stats.statusBreakdown && stats.statusBreakdown.map((status) => (
            <div key={status._id} className="stat-card">
              <div className="stat-number">{status.count}</div>
              <div className="stat-label">{status._id}</div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}
      {success && (
        <div className="success-message">
          {success}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}

      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="job-filter">Filter by Job:</label>
          <select
            id="job-filter"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="all">All Jobs</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.position} - {job.companyName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="course-filter">Course:</label>
          <select
            id="course-filter"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {COURSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="semester-filter">Semester:</label>
          <select
            id="semester-filter"
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            disabled={filterCourse === 'all'}
          >
            <option value="all">{filterCourse === 'all' ? 'Select Course First' : 'All Semesters'}</option>
            {semesterOptions.map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        {(filterCourse !== 'all' || filterSemester !== 'all') && (
          <button
            className="clear-filters-btn"
            onClick={() => { setFilterCourse('all'); setFilterSemester('all'); }}
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      <div className="applications-list" ref={listTopRef}>
        <div className="applications-header-row">
          <h2>Applications ({filteredApplications.length}{filteredApplications.length !== applications.length ? ` of ${applications.length}` : ''})</h2>
          <div className="list-controls">
            <label className="page-size">
              Show
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              per page
            </label>
          </div>
        </div>
        <div className="pagination-top">
          <span className="range">{filteredApplications.length ? `${startIndex}-${endIndex} of ${filteredApplications.length}` : '0 of 0'}</span>
          <div className="pagination">
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(n => (
              <button key={n} className={`page-btn ${currentPage === n ? 'active' : ''}`} onClick={() => setCurrentPage(n)}>{n}</button>
            ))}
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
        
        {filteredApplications.length === 0 ? (
          <div className="no-applications">
            <p>{applications.length === 0 ? 'No applications found.' : 'No applications match the selected filters.'}</p>
          </div>
        ) : (
          <div className="applications-grid">
            {paginatedApplications.map((application) => (
              <div key={application._id} className="application-card">
                <div className="application-header">
                  <div className="applicant-info">
                    <h3>{application.applicantName || 'N/A'}</h3>
                    <p className="applicant-email">{application.applicantEmail || 'N/A'}</p>
                    <p className="applicant-phone">{application.applicantPhone || 'N/A'}</p>
                  </div>
                  <div className="application-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(application.status) }}
                    >
                      {getStatusIcon(application.status)} {application.status || 'pending'}
                    </span>
                  </div>
                </div>
                
                <div className="application-details">
                  <div className="detail-row">
                    <span className="detail-label">Course:</span>
                    <span className="detail-value">{application.applicantCourse || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Semester:</span>
                    <span className="detail-value">{application.applicantSemester || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Track:</span>
                    <span className="detail-value">{application.applicantBranch || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Applied:</span>
                    <span className="detail-value">{formatDate(application.appliedAt)}</span>
                  </div>
                  {(application.resume || application.student?.resume) && (
                    <div className="detail-row">
                      <span className="detail-label">Resume:</span>
                      <span className="detail-value">
                        <a
                          href={`${API_ENDPOINTS.UPLOADS}${application.resume || application.student?.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Resume (PDF)
                        </a>
                      </span>
                    </div>
                  )}
                </div>
                
                {(() => {
                  // Resolve job details from populated application.job
                  const jobRef = application.job;
                  let jobObj = null;
                  if (jobRef && typeof jobRef === 'object') {
                    jobObj = jobRef;
                    // If populated object lacks expected fields, fallback to jobs list using _id
                    if (!jobObj.position && !jobObj.companyName && jobObj._id) {
                      const byId = jobs.find(j => j._id === jobObj._id);
                      if (byId) jobObj = byId;
                    }
                  } else if (jobRef) {
                    jobObj = jobs.find(j => j._id === jobRef);
                  }

                  const position = jobObj?.position || jobObj?.title || 'N/A';
                  const company = jobObj?.companyName || 'N/A';
                  const type = jobObj?.jobType || 'N/A';
                  if (!jobObj) return null;
                  return (
                    <div className="job-info">
                      <h4>Job Details</h4>
                      <p><strong>Position:</strong> {position}</p>
                      <p><strong>Company:</strong> {company}</p>
                      <p><strong>Type:</strong> {type}</p>
                    </div>
                  );
                })()}
                
                {application.formResponses && application.formResponses.length > 0 && (
                  <div className="form-responses">
                    <h4>Additional Information</h4>
                    {application.formResponses.map((response, index) => (
                      <div key={index} className="form-response">
                        <strong>{response.fieldLabel}:</strong>
                        <span className="response-value">
                          {response.fieldType === 'checkbox' && Array.isArray(response.response)
                            ? response.response.join(', ')
                            : response.response || 'Not provided'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="application-actions">
                  <div className="status-update">
                    <select
                      value={application.status || 'pending'}
                      onChange={(e) => updateApplicationStatus(
                        application._id, 
                        e.target.value, 
                        application.adminNotes || ''
                      )}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="selected">Selected</option>
                    </select>
                  </div>
                  
                  <div className="admin-notes">
                    <textarea
                      placeholder="Add admin notes..."
                      value={application.adminNotes || ''}
                      onChange={(e) => handleAdminNotesChange(application._id, e.target.value)}
                      onBlur={() => updateApplicationStatus(
                        application._id, 
                        application.status || 'pending', 
                        application.adminNotes || ''
                      )}
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pagination-bottom">
          <span className="range">{filteredApplications.length ? `${startIndex}-${endIndex} of ${filteredApplications.length}` : '0 of 0'}</span>
          <div className="pagination">
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(n => (
              <button key={n} className={`page-btn ${currentPage === n ? 'active' : ''}`} onClick={() => setCurrentPage(n)}>{n}</button>
            ))}
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ApplicationManagement;