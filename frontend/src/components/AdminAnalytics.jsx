import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, FileText, TrendingUp, Download, Calendar, Award, Building } from 'lucide-react';
import AdminHeader from './AdminHeader';
import './ApplicationManagement.css';

const API = import.meta.env.VITE_API_URL || '';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = () => localStorage.getItem('adminToken') || localStorage.getItem('authToken') || '';

  const refreshToken = async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (!rt) return false;
      const res = await fetch(`${API}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt })
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data?.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('authToken', data.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const parseJsonSafely = async (res) => {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Expected JSON, got: ${text.slice(0, 200)}`);
    }
    return res.json();
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const fetchWithAuth = async (path, options = {}, attempt = 1) => {
    const maxAttempts = 3;
    const backoffBase = 300;
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${getAuthToken()}`);
    headers.set('Accept', 'application/json');

    try {
      const res = await fetch(`${API}${path}`, { ...options, headers });
      if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return fetchWithAuth(path, options, attempt);
        }
        localStorage.removeItem('adminToken');
        localStorage.removeItem('authToken');
        navigate('/admin-login');
        throw new Error('Unauthorized');
      }
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      }
      return parseJsonSafely(res);
    } catch (err) {
      if (attempt < maxAttempts) {
        const delay = backoffBase * Math.pow(2, attempt - 1);
        await sleep(delay);
        return fetchWithAuth(path, options, attempt + 1);
      }
      throw err;
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use combined analytics report endpoint
      const report = await fetchWithAuth('/api/analytics/report');
      setAnalyticsData(report);
    } catch (primaryErr) {
      // Fallback to existing split endpoints if single endpoint is unavailable
      try {
        const [overview, applications, jobs, users] = await Promise.all([
          fetchWithAuth('/api/analytics/overview'),
          fetchWithAuth('/api/analytics/applications'),
          fetchWithAuth('/api/analytics/jobs'),
          fetchWithAuth('/api/analytics/users')
        ]);
        setAnalyticsData({
          usersSummary: {
            total: users?.usersByRole?.reduce((a, b) => a + (b.count || 0), 0) || 0,
            newThisWeek: users?.registrationsByDay?.slice(-7).reduce((a, b) => a + (b.count || 0), 0) || 0,
            growthRate: 0
          },
          revenue: {
            total: 0,
            monthly: 0,
            trend: []
          },
          activities: {
            dailyActive: users?.registrationsByDay?.slice(-1)[0]?.count || 0,
            weeklyActive: users?.registrationsByDay?.slice(-7).reduce((a, b) => a + (b.count || 0), 0) || 0,
            monthlyActive: users?.registrationsByDay?.slice(-30).reduce((a, b) => a + (b.count || 0), 0) || 0
          },
          overview,
          applications,
          jobs,
          users
        });
      } catch (fallbackErr) {
        setError(primaryErr.message || fallbackErr.message || 'Failed to fetch analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportData = (format) => {
    if (!analyticsData) return;
    const data = { ...analyticsData, exportedAt: new Date().toISOString() };
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `placement-analytics-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded shadow">
                  <div className="h-full w-full bg-gray-100" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-80 bg-white rounded shadow" />
              <div className="h-80 bg-white rounded shadow" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white p-6 rounded-lg shadow border border-red-200">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Failed to load analytics</h2>
            <p className="text-gray-700 mb-4 break-words">{String(error)}</p>
            <div className="flex space-x-3">
              <button onClick={fetchAnalyticsData} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Retry</button>
              <button onClick={() => navigate('/admin-login')} className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300">Go to Login</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="application-management-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header card to match Application Management */}
        <div className="application-management-header">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="m-0" style={{color:'#2c3e50', fontSize:'2.5rem', fontWeight:700}}>Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive placement insights and statistics</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => exportData('json')} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards (fallback to zeros if single endpoint structure is used) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => navigate('/admin-management')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/admin-management');
              }
            }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.overview?.overview?.totalStudents ?? analyticsData?.overview?.totalStudents ?? analyticsData?.usersSummary?.total ?? 0}</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => navigate('/admin-job-posting?tab=manage')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/admin-job-posting?tab=manage');
              }
            }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.overview?.overview?.totalJobs ?? analyticsData?.overview?.totalJobs ?? 0}</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => navigate('/application-management')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/application-management');
              }
            }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.overview?.overview?.totalApplications ?? analyticsData?.overview?.totalApplications ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Placement Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.overview?.overview?.placementRate ?? analyticsData?.overview?.placementRate ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Award className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students Placed</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.overview?.overview?.placedStudents ?? analyticsData?.overview?.placedStudents ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.overview?.overview?.activeJobs ?? analyticsData?.overview?.activeJobs ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <FileText className="h-6 w-6 text-cyan-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.overview?.overview?.recentApplications ?? analyticsData?.overview?.recentApplications ?? 0}</p>
              </div>
            </div>
          </div>

          {/*
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Building className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Package</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.overview?.overview?.averagePackage ?? analyticsData?.overview?.averagePackage ?? 0} LPA</p>
              </div>
            </div>
          </div>
          */}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Applications by Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.applicationsByStatus || analyticsData?.applications?.applicationsByStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status} (${count})`}
                  outerRadius={90}
                  dataKey="count"
                  nameKey="status"
                >
                  {(analyticsData?.applicationsByStatus || analyticsData?.applications?.applicationsByStatus || []).map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Applications by Month */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Month</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.applicationsByMonth || analyticsData?.applications?.applicationsByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Course Wise Applications */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Course</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.courseWiseApplications || analyticsData?.applications?.courseWiseApplications || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Job Types Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.jobsByType || analyticsData?.jobs?.jobsByType || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type} (${count})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analyticsData?.jobsByType || analyticsData?.jobs?.jobsByType || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recruiting Companies vs Applications */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruiting Companies vs Application Count</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.topCompanies || analyticsData?.jobs?.topCompanies || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="company" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applicationCount" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Students by Year */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Year</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.studentsByYear || analyticsData?.users?.studentsByYear || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Students */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Students</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(analyticsData?.topStudents || analyticsData?.applications?.topStudents || []).map((student, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.applicationCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.selectedCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.successRate >= 50 ? 'bg-green-100 text-green-800' : 
                        student.successRate >= 25 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.successRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{(analyticsData?.topCompanies || analyticsData?.jobs?.topCompanies || []).length}</div>
              <div className="text-sm text-gray-600">Recruiting Companies</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(analyticsData?.applicationsByStatus || analyticsData?.applications?.applicationsByStatus || []).find(item => item.status === 'Selected')?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Students Placed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(analyticsData?.jobsByMonth || analyticsData?.jobs?.jobsByMonth || []).reduce((sum, month) => sum + (month.count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Jobs This Year</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {(analyticsData?.topPositions || analyticsData?.jobs?.topPositions || []).length}
              </div>
              <div className="text-sm text-gray-600">Different Positions</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default AdminAnalytics;