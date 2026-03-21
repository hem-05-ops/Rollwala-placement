export const TOKEN_KEYS = ['studentToken', 'authToken', 'token'];

export const getAuthToken = () => {
  for (const key of TOKEN_KEYS) {
    const t = localStorage.getItem(key);
    if (t) return t;
  }
  return null;
};

export const setAuthToken = (token) => {
  localStorage.setItem('studentToken', token);
};

export const clearAuth = () => {
  for (const key of [...TOKEN_KEYS, 'studentUser', 'user', 'authUser']) {
    localStorage.removeItem(key);
  }
};

export const handleUnauthorized = () => {
  clearAuth();
  window.location.href = '/student-login';
};






