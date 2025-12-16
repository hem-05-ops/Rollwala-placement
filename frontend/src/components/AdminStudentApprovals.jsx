import React, { useEffect, useState } from 'react';
import AdminHeader from './AdminHeader';
import { getPendingStudents, approveStudent, cancelStudent } from '../../api/admin';
import { toast } from 'react-hot-toast';

const AdminStudentApprovals = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPending = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPendingStudents();
      setStudents(data || []);
    } catch (err) {
      const message = err?.error || err?.message || 'Failed to load pending students';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveStudent(id);
      toast.success('Student approved successfully');
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      const message = err?.error || err?.message || 'Failed to approve student';
      setError(message);
      toast.error(message);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelStudent(id);
      toast.success('Student registration request cancelled');
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      const message = err?.error || err?.message || 'Failed to cancel student request';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="user-management-container">
        <div className="user-management-header">
          <h1>🎓 Pending Student Approvals</h1>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <button
              onClick={() => setError('')}
              style={{ float: 'right', background: 'none', border: 'none', color: '#c53030', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="user-management-loading">Loading pending students...</div>
        ) : students.length === 0 ? (
          <div className="no-users">No pending student registrations.</div>
        ) : (
          <div className="users-grid">
            {students.map((student) => (
              <div key={student._id} className="user-card">
                <div className="user-info">
                  <div className="user-avatar">🎓</div>
                  <div className="user-details">
                    <h3>
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="user-email">{student.user?.email}</p>
                    <div className="user-meta">
                      <span className="user-role">Student</span>
                      <span className="user-joined">Course: {student.course}</span>
                      <span className="user-joined">Branch: {student.branch}</span>
                      <span className="user-joined">Year: {student.year}</span>
                      <span className="user-joined">Roll No: {student.rollNo}</span>
                    </div>
                  </div>
                </div>
                <div className="user-actions">
                  <button
                    className="toggle-status-btn"
                    onClick={() => handleApprove(student._id)}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="delete-user-btn"
                    onClick={() => handleCancel(student._id)}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminStudentApprovals;
