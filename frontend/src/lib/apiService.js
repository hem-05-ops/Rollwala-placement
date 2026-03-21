// Centralized API client with auth, retries, JSON validation, and cancellation

const API_BASE = import.meta.env.VITE_API_URL || '';

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_BACKOFF_MS = 300;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const getAuthToken = () =>
  localStorage.getItem('adminToken') || localStorage.getItem('authToken') || '';

const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('authToken', token);
  }
};

const getRefreshToken = () => localStorage.getItem('refreshToken') || '';

const classifyError = (status, contentType, bodySnippet) => {
  if (!status) return 'network_error';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (contentType && contentType.includes('text/html')) return 'html_response';
  if (contentType && contentType.includes('javascript')) return 'js_response';
  if (status >= 500) return 'server_error';
  return 'unknown_error';
};

const ensureJson = async (res) => {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    const kind = classifyError(res.status, ct, text);
    const err = new Error(`Expected JSON but received ${ct || 'unknown'}: ${text.slice(0, 200)}`);
    err.kind = kind;
    err.status = res.status;
    throw err;
  }
  return res.json();
};

const tryRefreshToken = async () => {
  try {
    const rt = getRefreshToken();
    if (!rt) return false;
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt })
    });
    if (!res.ok) return false;
    const data = await ensureJson(res);
    if (data?.token) {
      setAuthToken(data.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const apiRequest = async (path, { method = 'GET', headers = {}, body, signal, retry = DEFAULT_RETRY_ATTEMPTS, backoff = DEFAULT_BACKOFF_MS, requireAuth = false } = {}) => {
  const controller = !signal ? new AbortController() : null;
  const combinedSignal = signal || controller?.signal;

  const makeAttempt = async (attempt) => {
    const h = new Headers(headers);
    h.set('Accept', 'application/json');
    if (!(body instanceof FormData)) h.set('Content-Type', h.get('Content-Type') || 'application/json');
    if (requireAuth) h.set('Authorization', `Bearer ${getAuthToken()}`);

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: h,
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      signal: combinedSignal
    });

    if (res.status === 401 && requireAuth) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return makeAttempt(attempt); // retry with new token immediately
      }
    }

    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      const text = await res.text();
      const kind = classifyError(res.status, ct, text);
      const err = new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      err.kind = kind;
      err.status = res.status;
      throw err;
    }

    return ensureJson(res);
  };

  try {
    return await makeAttempt(1);
  } catch (err) {
    if (retry > 1 && err.kind !== 'unauthorized') {
      await sleep(backoff);
      return apiRequest(path, { method, headers, body, signal: combinedSignal, retry: retry - 1, backoff: backoff * 2, requireAuth });
    }
    throw err;
  } finally {
    // no-op; caller manages AbortController if provided
  }
};

// Convenience helpers
export const api = {
  get: (path, opts = {}) => apiRequest(path, { ...opts, method: 'GET' }),
  post: (path, body, opts = {}) => apiRequest(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts = {}) => apiRequest(path, { ...opts, method: 'PUT', body }),
  del: (path, opts = {}) => apiRequest(path, { ...opts, method: 'DELETE' })
};

// Debug helpers
export const debugRequest = async (path, opts = {}) => {
  try {
    const res = await fetch(`${API_BASE}${path}`, opts);
    const ct = res.headers.get('content-type') || '';
    const text = await res.text();
    return { status: res.status, contentType: ct, bodySnippet: text.slice(0, 300) };
  } catch (e) {
    return { error: e.message };
  }
};


