import React, { useEffect, useState } from 'react';
import AdminHeader from './AdminHeader';
import { toast } from 'react-hot-toast';
import './AdminManagement.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdminInterviewExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const loadExperiences = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/interview-experiences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        toast.error('Unauthorized. Please log in again.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load interview experiences');
      }

      const data = await response.json();
      setExperiences(data || []);
    } catch (err) {
      const message = err?.message || 'Failed to load interview experiences';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/interview-experiences/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved: true })
      });

      if (!response.ok) {
        throw new Error('Failed to approve experience');
      }

      toast.success('Interview experience approved successfully');
      loadExperiences();
    } catch (err) {
      const message = err?.message || 'Failed to approve experience';
      toast.error(message);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/interview-experiences/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved: false })
      });

      if (!response.ok) {
        throw new Error('Failed to reject experience');
      }

      toast.success('Interview experience rejected');
      loadExperiences();
    } catch (err) {
      const message = err?.message || 'Failed to reject experience';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview experience? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/interview-experiences/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete experience');
      }

      toast.success('Interview experience deleted successfully');
      loadExperiences();
    } catch (err) {
      const message = err?.message || 'Failed to delete experience';
      toast.error(message);
    }
  };

  const filteredExperiences = experiences.filter(exp => {
    if (filter === 'all') return true;
    if (filter === 'pending') return exp.approved === false;
    if (filter === 'approved') return exp.approved === true;
    if (filter === 'rejected') return exp.approved === false && exp.createdAt; // Assuming rejected means not approved
    return true;
  });

  const getStatusBadge = (approved) => {
    if (approved) {
      return <span className="status-badge approved">✅ Approved</span>;
    }
    return <span className="status-badge pending">⏳ Pending</span>;
  };

  return (
    <>
      <AdminHeader />
      <div className="user-management-container">
        <div className="user-management-header">
          <h1>💼 Interview Experience Management</h1>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({experiences.length})
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({experiences.filter(e => !e.approved).length})
            </button>
            <button
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved ({experiences.filter(e => e.approved).length})
            </button>
          </div>
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
          <div className="user-management-loading">Loading interview experiences...</div>
        ) : filteredExperiences.length === 0 ? (
          <div className="no-users">No interview experiences found.</div>
        ) : (
          <div className="users-grid">
            {filteredExperiences.map((exp) => (
              <div key={exp._id} className="user-card" style={{ maxWidth: '100%' }}>
                <div className="user-info">
                  <div className="user-avatar">💼</div>
                  <div className="user-details" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0' }}>{exp.company}</h3>
                        <p style={{ margin: '0', color: '#666' }}>Role: {exp.role}</p>
                      </div>
                      {getStatusBadge(exp.approved)}
                    </div>
                    
                    <div className="user-meta" style={{ marginBottom: '10px' }}>
                      <span className="user-role">By: {exp.submittedBy}</span>
                      {exp.student && (
                        <>
                          <span className="user-joined">Course: {exp.student.course || 'N/A'}</span>
                          <span className="user-joined">Branch: {exp.student.branch || 'N/A'}</span>
                          <span className="user-joined">Year: {exp.student.year || 'N/A'}</span>
                        </>
                      )}
                      {exp.package && <span className="user-joined">Package: {exp.package}</span>}
                      {exp.difficulty && <span className="user-joined">Difficulty: {exp.difficulty}</span>}
                      <span className="user-joined">
                        Submitted: {new Date(exp.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ 
                      background: '#f5f5f5', 
                      padding: '12px', 
                      borderRadius: '6px', 
                      marginBottom: '10px',
                      maxHeight: '150px',
                      overflowY: 'auto'
                    }}>
                      <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.6' }}>
                        <strong>Experience:</strong> {exp.experience}
                      </p>
                    </div>

                    {exp.tips && (
                      <div style={{ 
                        background: '#e8f5e9', 
                        padding: '10px', 
                        borderRadius: '6px', 
                        marginBottom: '10px',
                        fontSize: '13px'
                      }}>
                        <strong>Tips:</strong> {exp.tips}
                      </div>
                    )}

                    {exp.rounds && exp.rounds.length > 0 && (
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Rounds:</strong>
                        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                          {exp.rounds.map((round, idx) => (
                            <li key={idx} style={{ fontSize: '13px' }}>{round}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="user-actions" style={{ flexDirection: 'column', gap: '8px' }}>
                  {!exp.approved ? (
                    <button
                      className="toggle-status-btn"
                      onClick={() => handleApprove(exp._id)}
                    >
                      ✅ Approve
                    </button>
                  ) : (
                    <button
                      className="toggle-status-btn"
                      onClick={() => handleReject(exp._id)}
                      style={{ background: '#f59e0b' }}
                    >
                      ⏸️ Unapprove
                    </button>
                  )}
                  <button
                    className="delete-user-btn"
                    onClick={() => handleDelete(exp._id)}
                  >
                    🗑️ Delete
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

export default AdminInterviewExperiences;

