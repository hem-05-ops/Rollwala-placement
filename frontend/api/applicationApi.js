// frontend/src/api/applicationApi.js

// Use a direct URL instead of process.env for browser compatibility
const API_BASE_URL = 'http://localhost:3000/api'; // ← Backend port 3000

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      ...options,
    });

    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Server returned HTML:', text.substring(0, 200));
      throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error(error.message || 'Network request failed');
  }
};

// Get all applications
export const getAllApplications = async () => {
  return apiRequest('/applications');
};

// Get applications for a specific job
export const getJobApplications = async (jobId) => {
  return apiRequest(`/applications/job/${jobId}`);
};

// Get application statistics
export const getApplicationStats = async () => {
  return apiRequest('/applications/stats');
};

// Update application status
export const updateApplicationStatus = async (applicationId, statusData) => {
  return apiRequest(`/applications/${applicationId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  });
};

// Get my applications (for students)
export const getMyApplications = async () => {
  return apiRequest('/applications/my-applications');
};

// Get single application
export const getApplicationById = async (applicationId) => {
  return apiRequest(`/applications/${applicationId}`);
};