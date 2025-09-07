import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, FileText, TrendingUp, Download, Calendar, Award, Building } from 'lucide-react';
import AdminHeader from './AdminHeader';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalStudents: 0,
      totalJobs: 0,
      totalApplications: 0,
      placementRate: 0
    },
    applicationsByStatus: [],
    jobsByMonth: [],
    topCompanies: [],
    courseWiseApplications: [],
    packageDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch multiple analytics endpoints
      const [studentsRes, jobsRes, applicationsRes] = await Promise.all([
        fetch('/api/students/count', { headers }),
        fetch('/api/jobs', { headers }),
        fetch('/api/applications', { headers })
      ]);

      const students = studentsRes.ok ? await studentsRes.json() : [];
      const jobs = jobsRes.ok ? await jobsRes.json() : [];
      const applications = applicationsRes.ok ? await applicationsRes.json() : [];

      // Process data for analytics
      const processedAnalytics = {
        overview: {
          totalStudents: Array.isArray(students) ? students.length : 0,
          totalJobs: Array.isArray(jobs) ? jobs.length : 0,
          totalApplications: Array.isArray(applications) ? applications.length : 0,
          placementRate: Array.isArray(applications) && applications.length > 0 
            ? Math.round((applications.filter(app => app.status === 'selected').length / applications.length) * 100)
            : 0
        },
        applicationsByStatus: processApplicationsByStatus(applications),
        jobsByMonth: processJobsByMonth(jobs),
        topCompanies: processTopCompanies(jobs),
        courseWiseApplications: processCourseWiseApplications(applications),
        packageDistribution: processPackageDistribution(jobs)
      };

      setAnalytics(processedAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processApplicationsByStatus = (applications) => {
    if (!Array.isArray(applications)) return [];
    
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: applications.length > 0 ? Math.round((count / applications.length) * 100) : 0
    }));
  };

  const processJobsByMonth = (jobs) => {
    if (!Array.isArray(jobs)) return [];
    
    const monthCounts = jobs.reduce((acc, job) => {
      const month = new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(monthCounts).map(([month, count]) => ({ month, count }));
  };

  const processTopCompanies = (jobs) => {
    if (!Array.isArray(jobs)) return [];
    
    const companyCounts = jobs.reduce((acc, job) => {
      acc[job.companyName] = (acc[job.companyName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const processCourseWiseApplications = (applications) => {
    if (!Array.isArray(applications)) return [];
    
    const courseCounts = applications.reduce((acc, app) => {
      const course = app.applicantCourse || 'Unknown';
      acc[course] = (acc[course] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(courseCounts).map(([course, count]) => ({ course, count }));
  };

  const processPackageDistribution = (jobs) => {
    if (!Array.isArray(jobs)) return [];
    
    const packages = jobs.map(job => {
      const pkg = job.salaryPackage;
      if (!pkg) return null;
      
      const match = pkg.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : null;
    }).filter(pkg => pkg !== null);

    const ranges = [
      { range: '0-5 LPA', min: 0, max: 5 },
      { range: '5-10 LPA', min: 5, max: 10 },
      { range: '10-15 LPA', min: 10, max: 15 },
      { range: '15-20 LPA', min: 15, max: 20 },
      { range: '20+ LPA', min: 20, max: Infinity }
    ];

    return ranges.map(({ range, min, max }) => ({
      range,
      count: packages.filter(pkg => pkg >= min && pkg < max).length
    }));
  };

  const exportData = (format) => {
    const data = {
      overview: analytics.overview,
      applicationsByStatus: analytics.applicationsByStatus,
      topCompanies: analytics.topCompanies,
      exportedAt: new Date().toISOString()
    };

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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive placement insights and statistics</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => exportData('json')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalApplications}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview.placementRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Application Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.applicationsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.applicationsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Jobs Posted by Month */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Jobs Posted by Month</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.jobsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Companies */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Recruiting Companies</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topCompanies} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="company" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Package Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.packageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.topCompanies.length}</div>
              <div className="text-sm text-gray-600">Recruiting Companies</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics.applicationsByStatus.find(item => item.status === 'Selected')?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Students Placed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.jobsByMonth.reduce((sum, month) => sum + month.count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Job Postings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;