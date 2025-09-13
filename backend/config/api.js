// config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  JOBS: `${API_BASE_URL}/api/jobs`,
  STUDENT_PROFILE: `${API_BASE_URL}/api/students/profile`,
  APPLICATIONS: `${API_BASE_URL}/api/students/applications`,
  ELIGIBLE_JOBS: `${API_BASE_URL}/api/students/eligible-jobs`,
  UPLOADS: `${API_BASE_URL}/uploads`
};

export default API_BASE_URL;