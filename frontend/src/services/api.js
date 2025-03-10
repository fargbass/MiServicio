import axios from 'axios';
import { API_URL } from '../config';

// Crear una instancia de axios con URL base
const api = axios.create({
  baseURL: API_URL
});

// Interceptor para añadir el token en cada petición
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    // Redirigir al login si hay error 401 (no autorizado)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
