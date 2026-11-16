const getBaseUrl = () => {
  // 1. Explicitly configured via environment variable (local or production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // 2. Local development in browser: default to local Express server
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5000';
  }
  // 3. Deployed on Vercel (same-origin): use relative URLs
  return '';
};

const BASE_URL = getBaseUrl();

let authToken = localStorage.getItem('token') || null;
let onUnauthorizedCallback = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const setOnUnauthorized = (callback) => {
  onUnauthorizedCallback = callback;
};

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    // If 401 and not the login endpoint itself, trigger unauthorized callback
    if (response.status === 401 && endpoint !== '/login' && onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }

    const errorMessage =
      data?.error || data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }

  return data;
};

// Auth API calls
export const registerUser = (userData) =>
  request('/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

export const loginUser = (credentials) =>
  request('/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

export const getMe = () => request('/me');

// Tasks API calls
export const getTasks = () => request('/tasks');
export const getTaskStats = () => request('/tasks/stats');
export const getTaskById = (id) => request(`/tasks/${id}`);
export const createTask = (taskData) =>
  request('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
export const updateTask = (id, updates) =>
  request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
export const deleteTask = (id) =>
  request(`/tasks/${id}`, {
    method: 'DELETE'
  });

// AI Description Generator (P13, backend proxy)
export const generateDescription = (title) =>
  request('/api/ai/generate-description', {
    method: 'POST',
    body: JSON.stringify({ title })
  });
