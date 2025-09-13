import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHeader.css';

const AdminHeader = () => {
  const navigate = useNavigate();
  
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isSuperAdmin = adminUser.role === 'super_admin';

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
        <div className="admin-header-left">
          <h1>PMS Admin Panel</h1>
          <span className="admin-subtitle">Placement Management System</span>
        </div>
        
        <div className="admin-header-center">
          <nav className="admin-nav">
            <button 
              className="nav-btn"
              onClick={() => handleNavigation('/admin-job-posting')}
            >
            Job Management
            </button>
            {isSuperAdmin && (
              <>
                <button 
                  className="nav-btn"
                  onClick={() => handleNavigation('/application-management')}
                >
                Application Management
                </button>
                <button 
                  className="nav-btn"
                  onClick={() => handleNavigation('/admin-management')}
                >
                  User Management
                </button>
                <button 
                  className="nav-btn"
                  onClick={() => handleNavigation('/admin-analytics')}
                >
                  📊 Analytics
                </button>
              </>
            )}
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
