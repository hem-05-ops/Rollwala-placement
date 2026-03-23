import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHeader.css';
import logo from '../assets/gulogo2.png';
import { fetchPendingCounts } from '../../api';

const AdminHeader = () => {
  const navigate = useNavigate();
  
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isSuperAdmin = adminUser.role === 'super_admin';

  const [pendingCounts, setPendingCounts] = useState({
    pendingStudents: 0,
    pendingApplications: 0
  });

  useEffect(() => {
    const loadPendingCounts = async () => {
      try {
        const response = await fetchPendingCounts();
        console.log('✅ Pending Counts Response:', response.data);
        setPendingCounts(response.data);
      } catch (error) {
        console.error('❌ Failed to load pending counts:', error);
      }
    };
    
    // Initial fetch
    loadPendingCounts();
    
    // Optional polling (e.g., every 30 seconds)
    // const intervalId = setInterval(loadPendingCounts, 30000);
    // return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <img 
          src={logo} 
          alt="Rollwala Logo" 
          className="admin-logo"
          title={isSuperAdmin ? "Go to Admin Analytics" : "Rollwala Admin Panel"}
          onClick={() => navigate(isSuperAdmin ? '/admin-analytics' : '/admin-job-posting')}
        />
        <div className="admin-header-left">
          <h1>Rollwala Admin Panel</h1>
          {/* <span className="admin-subtitle">Placement Management System</span> */}
        </div>
        
        <div className="admin-header-center">
          <nav className="admin-nav">
            <button 
              className="nav-btn"
              onClick={() => handleNavigation('/admin-job-posting')}
            >
            Job Management
            </button>
            <button 
              className="nav-btn"
              onClick={() => handleNavigation('/application-management')}
            >
              Application Management
              {pendingCounts.pendingApplications > 0 && (
                <span className="notification-badge">{pendingCounts.pendingApplications}</span>
              )}
            </button>
            <button 
              className="nav-btn"
              onClick={() => handleNavigation('/admin-students')}
            >
              Student Approvals
              {pendingCounts.pendingStudents > 0 && (
                <span className="notification-badge">{pendingCounts.pendingStudents}</span>
              )}
            </button>
            <button 
              className="nav-btn"
              onClick={() => handleNavigation('/admin-management')}
            >
              User Management
            </button>
            <button
              className="nav-btn"
              onClick={() => handleNavigation('/admin-practice-questions')}
            >
              Practice Questions
            </button>
            {isSuperAdmin && (
              <button 
                className="nav-btn"
                onClick={() => handleNavigation('/admin-analytics')}
              >
                📊 Analytics
              </button>
            )}
            <button 
              className="nav-btn"
              onClick={() => handleNavigation('/admin-interview-experiences')}
            >
              💼 Interview Experiences
            </button>
          </nav>
        </div>
        
        <div className="admin-header-right">
          <div className="admin-user-info">
            <span className="admin-name">👤 {adminUser.name || 'Admin'}</span>
            <span className="admin-role">
              {isSuperAdmin ? ' Super Admin' : ' Admin'}
            </span>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
             Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
