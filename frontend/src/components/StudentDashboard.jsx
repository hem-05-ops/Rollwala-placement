import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Briefcase, 
  FileText, 
  Calendar, 
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Eye,
  X,
  MessageSquare,
  Clock,
  MapPin,
  IndianRupee,
  Building,
  Star,
  CheckCircle
} from 'lucide-react';
import StudentCalendar from './StudentCalendar';
import { getAuthToken, handleUnauthorized } from '../lib/auth';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [eligibleJobs, setEligibleJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [interviewExperiences, setInterviewExperiences] = useState([]);
  const [loadingExperiences, setLoadingExperiences] = useState(false);
  const [experienceFilter, setExperienceFilter] = useState({ company: '', role: '' });
  const navigate = useNavigate();

  // Pagination state for jobs
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // Add API_BASE_URL constant
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Logo utility function
  const getCompanyLogoUrl = (logoPath) => {
    // Default fallback to a known asset served by backend
    if (!logoPath) return `${API_BASE_URL}/assets/faculties/bg-logo.png`;

    // Already absolute (Cloudinary/external)
    if (logoPath.startsWith('http')) return logoPath;

    // Any root-relative path like /assets/... or /uploads/...
    if (logoPath.startsWith('/')) return `${API_BASE_URL}${logoPath}`;

    // Plain filename -> assume it lives under uploads/
    return `${API_BASE_URL}/uploads/${logoPath}`;
  };

  const [profileEditData, setProfileEditData] = useState({
    cgpa: '',
    contact: '',
    skills: [],
    linkedin: '',
    github: '',
    projects: [], // Now a simple array of strings
    certifications: [],
    achievements: []
  });

  const [interviewFormData, setInterviewFormData] = useState({
    company: '',
    role: '',
    package: '',
    experience: '',
    difficulty: 'Medium',
    rounds: [],
    tips: ''
  });
  const [resumeUploading, setResumeUploading] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const user = JSON.parse(localStorage.getItem('studentUser') || localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'student') {
      navigate('/student-login');
      return;
    }

    fetchStudentData();
  }, [navigate]);

  const fetchStudentData = async () => {
    try {
      const token = getAuthToken();
      const userFromStorage = JSON.parse(localStorage.getItem('studentUser') || localStorage.getItem('user') || '{}');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch student profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/students/profile`, { headers });
      
      if (profileResponse.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (profileResponse.status === 404) {
        // Auto-create a student profile with whatever we have from registration
        try {
          const createPayload = {
            rollNo: userFromStorage.rollNo || undefined,
            course: userFromStorage.course || undefined,
            branch: userFromStorage.branch || undefined,
            semester: userFromStorage.semester || undefined,
            cgpa: typeof userFromStorage.cgpa === 'number' ? userFromStorage.cgpa : undefined,
            contact: userFromStorage.contact || undefined
          };
          await fetch(`${API_BASE_URL}/api/students/create-profile`, {
            method: 'POST',
            headers,
            body: JSON.stringify(createPayload)
          });
          const retry = await fetch(`${API_BASE_URL}/api/students/profile`, { headers });
          if (retry.ok) {
            const retryData = await retry.json();
            // Merge registered user for display
            setStudent({
              ...retryData,
              user: { ...(retryData.user || {}), ...(userFromStorage || {}) }
            });
          } else {
            // Fallback to registered user details only
            setStudent({
              user: userFromStorage || {},
              rollNo: userFromStorage.rollNo || '—',
              course: userFromStorage.course || '—',
              branch: userFromStorage.branch || '—',
              semester: userFromStorage.semester || '—',
              cgpa: userFromStorage.cgpa ?? '—',
              contact: userFromStorage.contact || '—',
              skills: [],
              projects: [],
              certifications: [],
              achievements: []
            });
          }
        } catch (e) {
          console.warn('Auto create-profile failed:', e);
          // Fallback to registered user details only
          setStudent({
            user: userFromStorage || {},
            rollNo: userFromStorage.rollNo || '—',
            course: userFromStorage.course || '—',
            branch: userFromStorage.branch || '—',
            semester: userFromStorage.semester || '—',
            cgpa: userFromStorage.cgpa ?? '—',
            contact: userFromStorage.contact || '—',
            skills: [],
            projects: [],
            certifications: [],
            achievements: []
          });
        }
      } else if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        // Merge registered user for display
        setStudent({
          ...profileData,
          user: { ...(profileData.user || {}), ...(userFromStorage || {}) }
        });
        // Initialize edit form from profile
        setProfileEditData({
          cgpa: profileData.cgpa ?? '',
          contact: profileData.contact ?? '',
          skills: Array.isArray(profileData.skills) ? profileData.skills : [],
          linkedin: profileData.linkedin || '',
          github: profileData.github || '',
          projects: Array.isArray(profileData.projects) ? profileData.projects : [],
          certifications: Array.isArray(profileData.certifications) ? profileData.certifications : [],
          achievements: Array.isArray(profileData.achievements) ? profileData.achievements : []
        });
      }

      // Fetch ALL jobs (not just eligible ones) - Use the same endpoint as Jobs.jsx
      console.log('Fetching all jobs from:', `${API_BASE_URL}/api/jobs`);
      const jobsResponse = await fetch(`${API_BASE_URL}/api/jobs`, { 
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Jobs response status:', jobsResponse.status);
      
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        console.log('All jobs data received:', jobsData);
        setEligibleJobs(jobsData);
      } else {
        const errorText = await jobsResponse.text();
        console.error('Jobs fetch error:', errorText);
      }

      // Fetch applications
      const applicationsResponse = await fetch(`${API_BASE_URL}/api/students/applications`, { headers });
      if (applicationsResponse.status === 401) {
        handleUnauthorized();
        return;
      }
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData);
      }
      
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('studentUser');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for resume.');
      return;
    }

    try {
      setResumeUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${API_BASE_URL}/api/students/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json().catch(() => null);
      if (response.ok) {
        toast.success('Resume uploaded successfully');
        if (data?.student) {
          setStudent(prev => ({ ...(prev || {}), ...data.student }));
        } else if (data?.resume) {
          setStudent(prev => prev ? { ...prev, resume: data.resume } : prev);
        }
      } else {
        toast.error(data?.error || 'Failed to upload resume');
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      toast.error('Failed to upload resume');
    } finally {
      setResumeUploading(false);
      // Reset the input so the same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleApplyForJob = async (jobId) => {
    try {
      // Frontend guard: check if student.semester is in job.eligibleSemesters
      // Since we don't have the full job object here with eligibleSemesters (wait, we do have eligibleJobs)
      const job = eligibleJobs.find(j => j._id === jobId);
      if (job && job.eligibleSemesters && !job.eligibleSemesters.includes(student?.semester)) {
        toast.error(`You are not eligible for this job. Your semester (${student?.semester}) is not in the eligible list.`);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/students/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId, formResponses: [] })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Application submitted successfully!');
        setShowApplicationForm(false);
        setSelectedJob(null);
        fetchStudentData(); // Refresh data
      } else {
        toast.error(data.error || 'Application failed');
      }
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Application failed');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/students/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileEditData)
      });

      // Get response as text first to handle non-JSON responses
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Server returned invalid response');
      }

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setShowProfileEdit(false);
        fetchStudentData();
      } else {
        console.error('Profile update failed:', data);
        toast.error(data.error || data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Update failed. Please try again.');
    }
  };

  const fetchInterviewExperiences = async () => {
    try {
      setLoadingExperiences(true);
      const response = await fetch(`${API_BASE_URL}/api/interview-experiences/approved`);
      if (response.ok) {
        const data = await response.json();
        setInterviewExperiences(data || []);
      } else {
        console.error('Failed to fetch experiences');
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoadingExperiences(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'experiences') {
      fetchInterviewExperiences();
    }
  }, [activeTab]);

  const handleInterviewSubmission = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/interview-experiences/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...interviewFormData,
          rounds: interviewFormData.rounds.filter(r => r.trim())
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Interview experience submitted successfully! It will be reviewed by admin.');
        setShowInterviewForm(false);
        setInterviewFormData({
          company: '',
          role: '',
          package: '',
          experience: '',
          difficulty: 'Medium',
          rounds: [],
          tips: ''
        });
        // Refresh experiences list
        if (activeTab === 'experiences') {
          fetchInterviewExperiences();
        }
      } else {
        toast.error(data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Submission failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'selected': return 'bg-green-100 text-green-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'interviewed': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
              {student && (
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Welcome back, {(student.user?.firstName || '') + (student.user?.lastName ? ' ' + student.user.lastName : '')}</p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfileEdit(true)}
                className="p-2 text-gray-600 hover:text-blue-600"
                title="Edit Profile"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'jobs', label: 'Available Jobs', icon: Briefcase },
              { id: 'applications', label: 'My Applications', icon: FileText },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'experiences', label: 'Interview Experiences', icon: MessageSquare }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  if (id === 'jobs') setCurrentPage(1);
                }}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && student && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{(student.user?.firstName || '') + (student.user?.lastName ? ' ' + student.user.lastName : '')}</h3>
                  <p className="text-gray-600">{student.rollNo}</p>
                  <p className="text-sm text-gray-500">{student.course} • {student.branch} • Sem {student.semester}</p>
                  <div className="mt-4 flex justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      CGPA: {student.cgpa}
                    </span>
                  </div>
                </div>

                {/* Resume Upload & View */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Resume</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your latest resume in PDF format so that the placement team and companies can review it.
                  </p>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{resumeUploading ? 'Uploading...' : 'Upload PDF Resume'}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleResumeUpload}
                        disabled={resumeUploading}
                      />
                    </label>
                    {student?.resume && (
                      <a
                        href={`${API_BASE_URL}${student.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View Resume
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact</p>
                    <p className="text-sm text-gray-900">{student.contact}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{student.user?.email}</p>
                  </div>
                  {student.skills && student.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {student.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Available Jobs</p>
                      <p className="text-2xl font-semibold text-gray-900">{eligibleJobs.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Applications</p>
                      <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {applications.filter(app => app.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {applications.length > 0 
                          ? Math.round((applications.filter(app => app.status === 'selected').length / applications.length) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Eye className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium">Browse Jobs</span>
                  </button>
                  <button
                    onClick={() => setShowInterviewForm(true)}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Plus className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium">Share Experience</span>
                  </button>
                  <button
                    onClick={() => navigate('/practice-courses')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium">Practice</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (() => {
          const indexOfLastJob = currentPage * jobsPerPage;
          const indexOfFirstJob = indexOfLastJob - jobsPerPage;
          const currentJobs = eligibleJobs.slice(indexOfFirstJob, indexOfLastJob);
          const totalPages = Math.ceil(eligibleJobs.length / jobsPerPage);

          return (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Available Jobs</h2>
                <p className="text-sm text-gray-600">{eligibleJobs.length} jobs match your profile</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentJobs.map((job) => {
                  const hasApplied = applications.some(app => app.job?._id === job._id);
                  const isEligibleSemester = job.eligibleSemesters?.includes(student?.semester);
                  return (
                    <div key={job._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.position}</h3>
                          <p className="text-sm text-gray-600">{job.companyName}</p>
                        </div>
                        {job.companyLogo && (
                          <img 
                            src={getCompanyLogoUrl(job.companyLogo)} 
                            alt={job.companyName} 
                            className="h-10 w-10 rounded object-contain bg-white border border-gray-200 p-1"
                            onError={(e) => {
                              console.error('Failed to load logo:', getCompanyLogoUrl(job.companyLogo));
                              e.target.src = `${API_BASE_URL}/assets/faculties/bg-logo.png`;
                              e.target.onerror = null;
                            }}
                          />
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <IndianRupee className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{job.salaryPackage}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Apply by: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {job.jobDescriptionFile && (
                        <div className="mb-3">
                          <a
                            href={`${API_BASE_URL}${job.jobDescriptionFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            View Job Description (JD)
                          </a>
                        </div>
                      )}
                      
                      {hasApplied ? (
                        <button
                          disabled
                          className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed"
                        >
                          Already Applied
                        </button>
                      ) : !isEligibleSemester ? (
                        <button
                          disabled
                          className="w-full py-2 px-4 bg-gray-100 text-gray-400 rounded-md text-sm font-medium cursor-not-allowed"
                        >
                          Not eligible to apply (Sem {student?.semester})
                        </button>
                      ) : (job.minCgpa > 0 && student?.cgpa < job.minCgpa) ? (
                        <div className="w-full py-2 px-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm font-bold text-center">
                          You are not eligible to apply
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowApplicationForm(true);
                          }}
                          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          );
        })()}

           {/* Applications Kanban Tab */}
        {activeTab === 'applications' && (() => {
          const statuses = [
            { 
              id: 'pending', 
              title: 'Applied', 
              color: 'text-amber-600', 
              bgBase: 'bg-amber-50',
              borderTheme: 'border-t-amber-400',
              icon: <Clock className="w-5 h-5 text-amber-500" />
            },
            { 
              id: 'shortlisted', 
              title: 'Shortlisted', 
              color: 'text-blue-600', 
              bgBase: 'bg-blue-50',
              borderTheme: 'border-t-blue-500',
              icon: <Star className="w-5 h-5 text-blue-500" />
            },
            { 
              id: 'selected', 
              title: 'Selected', 
              color: 'text-emerald-600', 
              bgBase: 'bg-emerald-50',
              borderTheme: 'border-t-emerald-500',
              icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
            }
          ];

          return (
            <div className="space-y-6">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Application Tracker</h2>
                  <p className="text-sm text-gray-500 mt-1">Visually monitor your journey from application to offer.</p>
                </div>
              </div>
              
              <div className="flex overflow-x-auto gap-6 pb-6 min-h-[600px] items-start" style={{ scrollbarWidth: 'thin' }}>
                {statuses.map(statusCol => {
                  const colApps = applications.filter(app => app.status === statusCol.id);
                  return (
                    <div key={statusCol.id} className="flex-shrink-0 w-[340px] bg-slate-50/80 rounded-2xl flex flex-col max-h-[800px] border border-slate-200 shadow-sm relative overflow-hidden">
                      {/* Top colored accent line */}
                      <div className={`absolute top-0 left-0 right-0 h-1 border-t-[3px] ${statusCol.borderTheme}`}></div>
                      
                      {/* Column Header */}
                      <div className="p-5 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${statusCol.bgBase} shadow-sm border border-white`}>
                            {statusCol.icon}
                          </div>
                          <h3 className="text-lg font-semibold text-slate-800 tracking-wide">{statusCol.title}</h3>
                        </div>
                        <span className="bg-white text-slate-700 py-1 px-3 border border-slate-200 rounded-full text-sm font-bold shadow-sm">
                          {colApps.length}
                        </span>
                      </div>
                      
                      {/* Column Content */}
                      <div className="p-4 overflow-y-auto flex-1 space-y-4" style={{ scrollbarWidth: 'none' }}>
                        {colApps.length === 0 ? (
                          <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 mt-2">
                            <span className="text-sm font-medium">No applications</span>
                          </div>
                        ) : (
                          colApps.map(app => (
                            <div key={app._id} className="group bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative overflow-hidden">
                              {/* Left status indicator line */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusCol.bgBase.replace('50', '400')} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                              
                              <h4 className="font-bold text-slate-800 mb-2 truncate text-base" title={app.job?.position}>
                                {app.job?.position || 'Position not available'}
                              </h4>
                              
                              <p className="text-sm text-slate-600 font-medium mb-4 flex items-center gap-2 truncate" title={app.job?.companyName}>
                                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                                  <Building className="w-3.5 h-3.5 flex-shrink-0" />
                                </div>
                                {app.job?.companyName || 'Company not available'}
                              </p>
                              
                              <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                                <span className="flex items-center gap-1.5 text-slate-500 font-medium bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                                {app.job?.salaryPackage && (
                                  <span className="flex items-center gap-1 font-bold text-slate-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-100">
                                    <IndianRupee className="w-3 h-3 text-emerald-500" />
                                    {app.job.salaryPackage}
                                  </span>
                                )}
                              </div>
                              
                              {app.adminNotes && (
                                <div className="mt-4 text-xs bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200/50 relative">
                                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-400 rounded-l-lg"></div>
                                  <span className="font-bold block mb-1 text-amber-900 ml-1 tracking-wide text-[10px] uppercase">Review Note</span>
                                  <span className="ml-1 leading-relaxed">{app.adminNotes}</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <StudentCalendar />
        )}

        {/* Interview Experiences Tab */}
        {activeTab === 'experiences' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Interview Experiences</h2>
              <button
                onClick={() => setShowInterviewForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Share Experience
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Filter by Company"
                  value={experienceFilter.company}
                  onChange={(e) => setExperienceFilter({ ...experienceFilter, company: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Filter by Role"
                  value={experienceFilter.role}
                  onChange={(e) => setExperienceFilter({ ...experienceFilter, role: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Experiences List */}
            {loadingExperiences ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading experiences...</p>
              </div>
            ) : interviewExperiences.filter(exp => 
              (!experienceFilter.company || exp.company?.toLowerCase().includes(experienceFilter.company.toLowerCase())) &&
              (!experienceFilter.role || exp.role?.toLowerCase().includes(experienceFilter.role.toLowerCase()))
            ).length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No interview experiences found.</p>
                <p className="text-sm mt-2">Be the first to share your interview experience!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {interviewExperiences
                  .filter(exp => 
                    (!experienceFilter.company || exp.company?.toLowerCase().includes(experienceFilter.company.toLowerCase())) &&
                    (!experienceFilter.role || exp.role?.toLowerCase().includes(experienceFilter.role.toLowerCase()))
                  )
                  .map((exp) => (
                    <div key={exp._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{exp.company}</h3>
                          <p className="text-sm text-gray-600">{exp.role}</p>
                        </div>
                        {exp.difficulty && (
                          <span className={`px-2 py-1 text-xs rounded ${
                            exp.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            exp.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {exp.difficulty}
                          </span>
                        )}
                      </div>
                      
                      {exp.submittedBy && (
                        <p className="text-xs text-gray-500 mb-2">By: {exp.submittedBy}</p>
                      )}
                      
                      {exp.package && (
                        <p className="text-sm font-medium text-gray-700 mb-2">Package: {exp.package}</p>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {exp.experience?.substring(0, 150)}
                        {exp.experience?.length > 150 ? '...' : ''}
                      </p>
                      
                      {exp.tips && (
                        <div className="mb-3 p-2 bg-green-50 rounded text-xs">
                          <strong>Tip:</strong> {exp.tips.substring(0, 100)}
                          {exp.tips.length > 100 ? '...' : ''}
                        </div>
                      )}
                      
                      <button
                        onClick={() => navigate(`/interview-experiences`, { state: { selectedExperience: exp } })}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Read More
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationForm && selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {selectedJob.companyLogo && (
                  <img 
                    src={getCompanyLogoUrl(selectedJob.companyLogo)} 
                    alt={selectedJob.companyName} 
                    className="h-8 w-8 rounded mr-3 object-contain bg-white border border-gray-200 p-1"
                    onError={(e) => {
                      e.target.src = `${API_BASE_URL}/assets/faculties/bg-logo.png`;
                      e.target.onerror = null;
                    }}
                  />
                )}
                <h3 className="text-lg font-medium">Apply for {selectedJob.position}</h3>
              </div>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Company: {selectedJob.companyName}</p>
              <p className="text-sm text-gray-600 mb-2">Package: {selectedJob.salaryPackage}</p>
              <p className="text-sm text-gray-600">Location: {selectedJob.location}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowApplicationForm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyForJob(selectedJob._id)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Confirm Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Experience Modal */}
      {showInterviewForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Share Interview Experience</h3>
              <button
                onClick={() => setShowInterviewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={interviewFormData.company}
                    onChange={(e) => setInterviewFormData({...interviewFormData, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    value={interviewFormData.role}
                    onChange={(e) => setInterviewFormData({...interviewFormData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Job role"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                  <input
                    type="text"
                    value={interviewFormData.package}
                    onChange={(e) => setInterviewFormData({...interviewFormData, package: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 12 LPA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={interviewFormData.difficulty}
                    onChange={(e) => setInterviewFormData({...interviewFormData, difficulty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Experience</label>
                <textarea
                  value={interviewFormData.experience}
                  onChange={(e) => setInterviewFormData({...interviewFormData, experience: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your interview experience..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tips for Others</label>
                <textarea
                  value={interviewFormData.tips}
                  onChange={(e) => setInterviewFormData({...interviewFormData, tips: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any tips or advice for future candidates..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowInterviewForm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInterviewSubmission}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Submit Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Profile</h3>
              <button
                onClick={() => setShowProfileEdit(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={profileEditData.cgpa}
                    onChange={(e) => setProfileEditData({...profileEditData, cgpa: parseFloat(e.target.value) || ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="tel"
                    value={profileEditData.contact}
                    onChange={(e) => setProfileEditData({...profileEditData, contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={profileEditData.linkedin}
                    onChange={(e) => setProfileEditData({...profileEditData, linkedin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="LinkedIn profile URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                  <input
                    type="url"
                    value={profileEditData.github}
                    onChange={(e) => setProfileEditData({...profileEditData, github: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="GitHub profile URL"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={profileEditData.skills.join(', ')}
                  onChange={(e) => setProfileEditData({
                    ...profileEditData, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="JavaScript, React, Node.js, Python..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certifications (comma separated)</label>
                <input
                  type="text"
                  value={profileEditData.certifications.join(', ')}
                  onChange={(e) => setProfileEditData({
                    ...profileEditData, 
                    certifications: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="AWS Certified, Google Analytics..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Achievements (comma separated)</label>
                <input
                  type="text"
                  value={profileEditData.achievements.join(', ')}
                  onChange={(e) => setProfileEditData({
                    ...profileEditData, 
                    achievements: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dean's List, Hackathon Winner..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowProfileEdit(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;