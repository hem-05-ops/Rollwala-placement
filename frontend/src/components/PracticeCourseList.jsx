import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchCourses, fetchUserScore } from '../lib/practiceApi';
import API_BASE_URL from '../config/api';

const PracticeCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentScores, setRecentScores] = useState([]);
  const [loadingScore, setLoadingScore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCourses();

        // Determine student's course & branch from backend profile (more reliable than just localStorage)
        let studentCourse = null;
        let studentBranch = null;
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const res = await fetch(`${API_BASE_URL}/api/students/profile`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (res.ok) {
              const profile = await res.json();
              studentCourse = profile.course || null;
              studentBranch = profile.branch || null;
            }
          }
        } catch (e) {
          console.warn('Failed to load student profile for practice filtering:', e);
        }

        // Fallback: try localStorage user object if profile not available
        if (!studentCourse) {
          const rawUser = localStorage.getItem('studentUser') || localStorage.getItem('user');
          if (rawUser) {
            try {
              const user = JSON.parse(rawUser);
              studentCourse = user.course || null;
              studentBranch = user.branch || null;
            } catch (e) {
              console.warn('Failed to parse stored user for practice course filter:', e);
            }
          }
        }

        let filtered = data || [];
        if (studentCourse) {
          const course = studentCourse;
          const branch = studentBranch;

          let matches = filtered;

          // Map student course/branch to practice course names
          if (course === 'BSc.CS') {
            matches = filtered.filter((c) => c.name.toLowerCase().startsWith('bsc '));
          } else if (course === 'MCA') {
            matches = filtered.filter((c) => c.name.toLowerCase() === 'mca');
          } else if (course === 'MSc.AIML') {
            matches = filtered.filter((c) => c.name.toLowerCase().includes('msc (ai & ml')); // "MSc (AI & ML)"
          } else if (course === 'MSc.CS') {
            if (branch === 'AIML') {
              matches = filtered.filter((c) =>
                c.name.toLowerCase().includes('ai & ml track') ||
                c.name.toLowerCase().includes('ai & ml')
              );
            } else if (branch === 'WD') {
              matches = filtered.filter((c) =>
                c.name.toLowerCase().includes('web technologies')
              );
            }
          }

          if (matches.length >= 1) {
            // Prefer the first match; students should only see their own course
            filtered = [matches[0]];
          }
        }

        setCourses(filtered);

        // If we have a single course and a user ID, load recent score summary
        if (filtered.length === 1) {
          const courseId = filtered[0]._id;
          let userId = null;
          const rawUser = localStorage.getItem('studentUser') || localStorage.getItem('user');
          if (rawUser) {
            try {
              const user = JSON.parse(rawUser);
              userId = user.id || user._id || user.userId || null;
            } catch (e) {
              console.warn('Failed to parse user for practice score:', e);
            }
          }

          if (userId) {
            setLoadingScore(true);
            try {
              const result = await fetchUserScore(courseId, userId);
              const attempts = Array.isArray(result?.attempts) ? result.attempts : [];
              setRecentScores(attempts);
            } catch (e) {
              // 404 = no attempts yet; ignore
              console.warn('No recent practice score or failed to load:', e?.response?.data || e.message);
            } finally {
              setLoadingScore(false);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load courses', err);
        toast.error('Failed to load practice courses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Student-style header (similar to StudentDashboard) */}
      <header className="bg-black shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Student Portal</h1>
              <div className="ml-4">
                <p className="text-sm text-gray-300">
                  Practice Module
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="px-4 py-2 text-sm font-medium text-white border border-gray-600 rounded-md hover:bg-gray-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* <h1 className="text-2xl font-bold text-gray-900 mb-4">Practice Courses</h1>
          <p className="text-sm text-gray-600 mb-6">Choose a course to start practicing MCQ questions.</p> */}

          {/* Recent practice summary */}
          <div className="mb-6">
            {loadingScore ? (
              <div className="bg-white p-4 rounded-lg shadow text-sm text-gray-500">
                Loading your recent practice score...
              </div>
            ) : recentScores && recentScores.length > 0 ? (
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-900 mb-2">Recent Practice Scores</p>
                <p className="text-xs text-gray-500 mb-3">Last {Math.min(recentScores.length, 5)} attempts for this course</p>
                <div className="space-y-2 text-xs sm:text-sm">
                  {recentScores.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="flex flex-wrap gap-4 justify-between border-t border-gray-100 pt-2 first:border-t-0 first:pt-0"
                    >
                      <div className="text-gray-500">Attempt #{idx + 1}</div>
                      <div className="flex flex-wrap gap-3">
                        <span className="text-gray-700">Q: {s.totalQuestions}</span>
                        <span className="text-green-600">Correct: {s.correctCount}</span>
                        <span className="text-red-600">Wrong: {s.wrongCount}</span>
                        <span className="text-blue-600">Score: {s.scorePercentage.toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg shadow text-sm text-gray-500">
                You haven't attempted this practice quiz yet. Start now by selecting the course below.
              </div>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              No practice courses available yet. Please contact your admin.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white border border-gray-200 text-left p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-start"
                >
                  <h2 className="font-semibold text-gray-900">{course.name}</h2>
                  {course.description && (
                    <p className="text-xs text-gray-600 mt-1">{course.description}</p>
                  )}

                  <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full">
                    <button
                      onClick={() => navigate(`/practice/${course._id}?type=technical`)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Technical Practice
                    </button>
                    <button
                      onClick={() => navigate(`/practice/${course._id}?type=aptitude`)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
                    >
                      Aptitude Practice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PracticeCourseList;
