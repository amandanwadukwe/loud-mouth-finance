import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});
// Request interceptor to add auth token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers['x-auth-token'] = token; // Change to match your server expectation
    }
    return config;
  }, error => Promise.reject(error));

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {
      localStorage.removeItem('jwt');
      //window.location = '/home'; // Redirect to login on 401 Unauthorized
    }
    return Promise.reject(error);
  }
);

export default api;