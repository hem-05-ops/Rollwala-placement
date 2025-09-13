import React, { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import './AdminManagement.css';
import { getAllUsers, inviteUser, toggleUserStatus, deleteUser } from '../../api/user';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'student'
  });

  // Role configuration based on your schema
  const roles = [
    { value: 'student', label: 'Student', icon: '' },
    { value: 'faculty', label: 'Faculty', icon: '' },
    { value: 'admin', label: 'Admin', icon: '' },
    { value: 'super_admin', label: 'Super Admin', icon: '' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Error fetching users. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let result = users;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      result = result.filter(user => user.isActive === isActive);
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(result);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await inviteUser(inviteForm);
      setSuccess(`User invitation sent successfully! ${result.tempPassword ? `Temporary password: ${result.tempPassword}` : ''}`);
      setInviteForm({ name: '', email: '', role: 'student' });
      setShowInviteForm(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Error sending invitation');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setError('');
      await toggleUserStatus(userId, currentStatus);
      setSuccess('User status updated successfully!');
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Error updating user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setError('');
      await deleteUser(userId);
      setSuccess('User deleted successfully!');
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Error deleting user');
    }
  };

  const handleInputChange = (e) => {
    setInviteForm({
      ...inviteForm,
      [e.target.name]: e.target.value
    });
  };

  const getRoleIcon = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.icon : '';
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : 'User';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="user-management-container">
        <AdminHeader />
        <div className="user-management-loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <AdminHeader />
      
      <div className="user-management-header">
        <h1>👥 User Management</h1>
        <button 
          className="invite-user-btn"
          onClick={() => setShowInviteForm(!showInviteForm)}
        >
          {showInviteForm ? '❌ Cancel' : '➕ Invite New User'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button onClick={() => setError('')} style={{float: 'right', background: 'none', border: 'none', color: '#c53030', cursor: 'pointer'}}>
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess('')} style={{float: 'right', background: 'none', border: 'none', color: '#2f855a', cursor: 'pointer'}}>
            ×
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="user-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Role:</label>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.icon} {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showInviteForm && (
        <div className="invite-form-container">
          <h2>📧 Invite New User</h2>
          <form className="invite-form" onSubmit={handleInviteSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={inviteForm.name}
                onChange={handleInputChange}
                required
                placeholder="Enter user name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={inviteForm.email}
                onChange={handleInputChange}
                required
                placeholder="Enter user email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={inviteForm.role}
                onChange={handleInputChange}
                required
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                📤 Send Invitation
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowInviteForm(false)}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-list">
        <h2>
          👥 Users ({filteredUsers.length})
          {roleFilter !== 'all' && ` - ${getRoleLabel(roleFilter)}s`}
          {statusFilter !== 'all' && ` - ${statusFilter === 'active' ? 'Active' : 'Inactive'}`}
        </h2>
        
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            {users.length === 0 
              ? "No users found. Invite your first user to get started!" 
              : "No users match your filters."}
          </div>
        ) : (
          <div className="users-grid">
            {filteredUsers.map((user) => (
              <div key={user._id} className={`user-card ${!user.isActive ? 'inactive' : ''}`}>
                <div className="user-info">
                  <div className="user-avatar">
                    {getRoleIcon(user.role)}
                    {user.isSuperAdmin && <span className="super-admin-badge"></span>}
                  </div>
                  <div className="user-details">
                    <h3>{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                    <div className="user-meta">
                      <span className={`user-role ${user.role}`}>
                        {getRoleIcon(user.role)} {getRoleLabel(user.role)}
                        {user.isSuperAdmin && ' (Super Admin)'}
                      </span>
                      <span className="user-joined">
                        Joined: {formatDate(user.createdAt)}
                      </span>
                    </div>
                    <p className="user-status">
                      Status: {user.isActive ? '✅ Active' : '❌ Inactive'}
                    </p>
                  </div>
                </div>
                
                <div className="user-actions">
                  <button
                    className="toggle-status-btn"
                    onClick={() => handleToggleStatus(user._id, user.isActive)}
                  >
                    {user.isActive ? '❌ Deactivate' : '✅ Activate'}
                  </button>
                  <button
                    className="delete-user-btn"
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={user.isSuperAdmin}
                    title={user.isSuperAdmin ? "Cannot delete super admin" : "Delete user"}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;