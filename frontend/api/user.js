// frontend/src/api/user.js

const API_BASE_URL = 'http://localhost:5000/api'; // Update with your backend URL

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error(error.message || 'Network request failed');
  }
};

// Get all users
export const getAllUsers = async () => {
  return apiRequest('/users');
};

// Invite a new user
export const inviteUser = async (userData) => {
  return apiRequest('/users/invite', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Toggle user status (activate/deactivate)
export const toggleUserStatus = async (userId, currentStatus) => {
  return apiRequest(`/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive: !currentStatus }),
  });
};

// Delete a user
export const deleteUser = async (userId) => {
  return apiRequest(`/users/${userId}`, {
    method: 'DELETE',
  });
};