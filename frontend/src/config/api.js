// API Configuration — fallback port MUST match backend/.env PORT value (3000)
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  JOBS: `${API_BASE_URL}/api/jobs`,
  UPLOADS: `${API_BASE_URL}`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  ADMIN_MANAGEMENT: `${API_BASE_URL}/api/admin-management`,
  AUTH: `${API_BASE_URL}/api/auth`,
  PRACTICE: `${API_BASE_URL}/api/practice`,
};

export default API_BASE_URL;