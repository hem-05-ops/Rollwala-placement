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
  Clock // Add this import
} from 'lucide-react';

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
  const navigate = useNavigate();

  // Add API_BASE_URL constant
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'student') {
      navigate('/student-login');
      return;
    }

    fetchStudentData();
  }, [navigate]);


  
const fetchStudentData = async () => {
  try {
    const token = localStorage.getItem('token');
    
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
      const errorData = await profileResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Authentication failed');
    }
    
    if (profileResponse.status === 404) {
      // Handle missing profile (create one)
      // ... your existing profile creation code ...
    } else if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      setStudent(profileData);
      // ... set profile edit data ...
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
    if (applicationsResponse.ok) {
      const applicationsData = await applicationsResponse.json();
      setApplications(applicationsData);
    }
    
  } catch (error) {
    console.error('Error fetching student data:', error);
    // ... error handling ...
  } finally {
    setLoading(false);
  }
};
  // ... rest of your component code remains the same

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleApplyForJob = async (jobId) => {
    try {
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
        toast.success('Interview experience submitted successfully!');
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
                  <p className="text-sm text-gray-600">Welcome back, {student.user?.name}</p>
                  <p className="text-xs text-gray-500">{student.rollNo} • {student.course} • {student.branch}</p>
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
              { id: 'experiences', label: 'Interview Experiences', icon: MessageSquare }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
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
                  <h3 className="text-xl font-semibold text-gray-900">{student.user?.name}</h3>
                  <p className="text-gray-600">{student.rollNo}</p>
                  <p className="text-sm text-gray-500">{student.course} • {student.branch} • {student.year}</p>
                  <div className="mt-4 flex justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      CGPA: {student.cgpa}
                    </span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Available Jobs</h2>
              <p className="text-sm text-gray-600">{eligibleJobs.length} jobs match your profile</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eligibleJobs.map((job) => {
                const hasApplied = applications.some(app => app.job?._id === job._id);
                return (
                  <div key={job._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.position}</h3>
                        <p className="text-sm text-gray-600">{job.companyName}</p>
                      </div>
                      {job.companyLogo && (
                        <img src={job.companyLogo} alt={job.companyName} className="h-10 w-10 rounded" />
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">📍 {job.location}</p>
                      <p className="text-sm text-gray-600">💰 {job.salaryPackage}</p>
                      <p className="text-sm text-gray-600">📅 Apply by: {new Date(job.applicationDeadline).toLocaleDateString()}</p>
                    </div>
                    
                    {hasApplied ? (
                      <button
                        disabled
                        className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed"
                      >
                        Already Applied
                      </button>
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
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <li key={application._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            {application.job?.position || 'Position not available'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                            {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Unknown'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{application.job?.companyName || 'Company not available'}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Applied on {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                        {application.adminNotes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>Admin Notes:</strong> {application.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
                {applications.length === 0 && (
                  <li className="p-6 text-center text-gray-500">
                    No applications submitted yet. Start applying to jobs!
                  </li>
                )}
              </ul>
            </div>
          </div>
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
            
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>View and share interview experiences with your peers.</p>
              <p className="text-sm">Help others prepare by sharing your interview journey!</p>
            </div>
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationForm && selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Apply for {selectedJob.position}</h3>
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