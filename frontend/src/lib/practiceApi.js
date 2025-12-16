import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/practice`,
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const studentToken = localStorage.getItem('token');

  // Prefer admin token for admin pages, fall back to student token for student practice
  const token = adminToken || studentToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchCourses = () => api.get('/courses').then((res) => res.data);
export const createCourse = (payload) => api.post('/courses', payload).then((res) => res.data);

export const fetchQuestionsByCourse = (courseId, options) => {
  const params = {};

  if (typeof options === 'string') {
    // Used by admin to filter by difficulty
    params.difficulty = options;
  } else if (options && typeof options === 'object') {
    if (options.type && options.type !== 'mixed') {
      params.type = options.type;
    }
    if (options.difficulty) {
      params.difficulty = options.difficulty;
    }
  }

  return api
    .get(`/questions/${courseId}`, { params })
    .then((res) => res.data);
};

export const createQuestion = (payload) => api.post('/questions', payload).then((res) => res.data);
export const updateQuestion = (id, payload) => api.put(`/questions/${id}`, payload).then((res) => res.data);
export const deleteQuestion = (id) => api.delete(`/questions/${id}`).then((res) => res.data);

export const submitAttempt = (payload) => api.post('/attempts', payload).then((res) => res.data);
export const fetchUserScore = (courseId, userId) =>
  api.get(`/attempts/score/${courseId}/${userId}`).then((res) => res.data);

export default api;
