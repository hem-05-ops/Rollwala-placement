const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');
const User = require('../models/User');

// Get comprehensive analytics overview
exports.getAnalyticsOverview = async (req, res) => {
  try {
    // Get total counts
    const totalStudents = await Student.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    
    // Get placement statistics
    const placedStudents = await Application.countDocuments({ status: 'selected' });
    const placementRate = totalApplications > 0 ? Math.round((placedStudents / totalApplications) * 100) : 0;
    
    // Get active jobs (posted in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeJobs = await Job.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentApplications = await Application.countDocuments({
      appliedAt: { $gte: sevenDaysAgo }
    });
    
    // Get average package
    const jobs = await Job.find({ salaryPackage: { $exists: true, $ne: '' } });
    const packages = jobs.map(job => {
      const match = job.salaryPackage.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : null;
    }).filter(pkg => pkg !== null);
    
    const averagePackage = packages.length > 0 
      ? Math.round(packages.reduce((sum, pkg) => sum + pkg, 0) / packages.length) 
      : 0;

    res.json({
      overview: {
        totalStudents,
        totalJobs,
        totalApplications,
        placementRate,
        placedStudents,
        activeJobs,
        recentApplications,
        averagePackage
      }
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get application analytics with real aggregations
exports.getApplicationAnalytics = async (req, res) => {
  try {
    // Application status distribution
    const statusStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationsByStatus = statusStats.map(stat => ({
      status: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
      count: stat.count,
      percentage: 0 // Will calculate after getting total
    }));

    const totalApplications = await Application.countDocuments();
    applicationsByStatus.forEach(item => {
      item.percentage = totalApplications > 0 ? Math.round((item.count / totalApplications) * 100) : 0;
    });

    // Applications by course
    const courseStats = await Application.aggregate([
      {
        $group: {
          _id: '$applicantCourse',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const courseWiseApplications = courseStats.map(stat => ({
      course: stat._id || 'Unknown',
      count: stat.count
    }));

    // Applications by month (last 12 months)
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    const monthlyStats = await Application.aggregate([
      {
        $match: {
          appliedAt: { $gte: yearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appliedAt' },
            month: { $month: '$appliedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const applicationsByMonth = monthlyStats.map(stat => {
      const date = new Date(stat._id.year, stat._id.month - 1);
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: stat.count
      };
    });

    // Top performing students (most applications)
    const topStudents = await Application.aggregate([
      {
        $group: {
          _id: '$student',
          applicationCount: { $sum: 1 },
          selectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'selected'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: '$studentInfo'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'studentInfo.user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          name: '$userInfo.name',
          course: '$studentInfo.course',
          applicationCount: 1,
          selectedCount: 1,
          successRate: {
            $cond: [
              { $gt: ['$applicationCount', 0] },
              { $round: [{ $multiply: [{ $divide: ['$selectedCount', '$applicationCount'] }, 100] }, 0] },
              0
            ]
          }
        }
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      applicationsByStatus,
      courseWiseApplications,
      applicationsByMonth,
      topStudents
    });
  } catch (error) {
    console.error('Error fetching application analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get job analytics with real aggregations
exports.getJobAnalytics = async (req, res) => {
  try {
    // Jobs posted by month (last 12 months)
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    const jobsByMonth = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: yearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const jobsByMonthFormatted = jobsByMonth.map(stat => {
      const date = new Date(stat._id.year, stat._id.month - 1);
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: stat.count
      };
    });

    // Top recruiting companies
    const topCompanies = await Job.aggregate([
      {
        $group: {
          _id: '$companyName',
          jobCount: { $sum: 1 },
          totalApplications: { $sum: 1 } // Will be updated with actual application count
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 }
    ]);

    // Get application counts for top companies
    const topCompaniesWithApps = await Promise.all(
      topCompanies.map(async (company) => {
        const jobs = await Job.find({ companyName: company._id }).select('_id');
        const jobIds = jobs.map(job => job._id);
        const applicationCount = await Application.countDocuments({ job: { $in: jobIds } });
        
        return {
          company: company._id,
          jobCount: company.jobCount,
          applicationCount
        };
      })
    );

    // Package distribution
    const jobs = await Job.find({ salaryPackage: { $exists: true, $ne: '' } });
    const packages = jobs.map(job => {
      const match = job.salaryPackage.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : null;
    }).filter(pkg => pkg !== null);

    const packageRanges = [
      { range: '0-5 LPA', min: 0, max: 5 },
      { range: '5-10 LPA', min: 5, max: 10 },
      { range: '10-15 LPA', min: 10, max: 15 },
      { range: '15-20 LPA', min: 15, max: 20 },
      { range: '20+ LPA', min: 20, max: Infinity }
    ];

    const packageDistribution = packageRanges.map(({ range, min, max }) => ({
      range,
      count: packages.filter(pkg => pkg >= min && pkg < max).length
    }));

    // Job type distribution
    const jobTypeStats = await Job.aggregate([
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 }
        }
      }
    ]);

    const jobsByType = jobTypeStats.map(stat => ({
      type: stat._id || 'Unknown',
      count: stat.count
    }));

    // Most popular job positions
    const positionStats = await Job.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topPositions = positionStats.map(stat => ({
      position: stat._id,
      count: stat.count
    }));

    res.json({
      jobsByMonth: jobsByMonthFormatted,
      topCompanies: topCompaniesWithApps,
      packageDistribution,
      jobsByType,
      topPositions
    });
  } catch (error) {
    console.error('Error fetching job analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    // User distribution by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Student distribution by course
    const studentsByCourse = await Student.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 }
        }
      }
    ]);

    // Student distribution by year
    const studentsByYear = await Student.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Student distribution by branch
    const studentsByBranch = await Student.aggregate([
      {
        $group: {
          _id: '$branch',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const registrationsByDay = recentRegistrations.map(stat => {
      const date = new Date(stat._id.year, stat._id.month - 1, stat._id.day);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: stat.count
      };
    });

    res.json({
      usersByRole: usersByRole.map(stat => ({
        role: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
        count: stat.count
      })),
      studentsByCourse: studentsByCourse.map(stat => ({
        course: stat._id || 'Unknown',
        count: stat.count
      })),
      studentsByYear: studentsByYear.map(stat => ({
        year: stat._id || 'Unknown',
        count: stat.count
      })),
      studentsByBranch: studentsByBranch.map(stat => ({
        branch: stat._id || 'Unknown',
        count: stat.count
      })),
      registrationsByDay
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get comprehensive analytics report
exports.getAnalyticsReport = async (req, res) => {
  try {
    const [overview, applications, jobs, users] = await Promise.all([
      exports.getAnalyticsOverview(req, { json: data => data }),
      exports.getApplicationAnalytics(req, { json: data => data }),
      exports.getJobAnalytics(req, { json: data => data }),
      exports.getUserAnalytics(req, { json: data => data })
    ]);

    res.json({
      overview: overview.overview,
      applications,
      jobs,
      users,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating analytics report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};