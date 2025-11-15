import axios from 'axios';

// Create axios instance with base configuration
// In development, use proxy (/api), in production use full URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (name, email, password) => {
    const response = await api.post('/users/register', { name, email, password });
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Devices API
export const devicesAPI = {
  getDevices: async () => {
    const response = await api.get('/devices');
    return response.data;
  },
  
  getDevice: async (id) => {
    const response = await api.get(`/devices/${id}`);
    return response.data;
  },
  
  createDevice: async (name, location, mac_address) => {
    const response = await api.post('/devices', { name, location, mac_address });
    return response.data;
  },
  
  updateDevice: async (id, data) => {
    const response = await api.put(`/devices/${id}`, data);
    return response.data;
  },
  
  deleteDevice: async (id) => {
    const response = await api.delete(`/devices/${id}`);
    return response.data;
  },
  
  generateDeviceToken: async (id) => {
    const response = await api.post(`/devices/${id}/token`);
    return response.data;
  },
};

// Ports API
export const portsAPI = {
  getPorts: async () => {
    const response = await api.get('/ports');
    return response.data;
  },
  
  getPort: async (id) => {
    const response = await api.get(`/ports/${id}`);
    return response.data;
  },
  
  createPort: async (name, type, threshold, autoCut) => {
    const response = await api.post('/ports', { name, type, threshold, autoCut });
    return response.data;
  },
  
  updatePort: async (id, data) => {
    const response = await api.put(`/ports/${id}`, data);
    return response.data;
  },
  
  deletePort: async (id) => {
    const response = await api.delete(`/ports/${id}`);
    return response.data;
  },
  
  switchPort: async (id, state) => {
    const response = await api.post(`/ports/${id}/switch`, { state });
    return response.data;
  },
  
  getSwitchActions: async (id, limit = 100, offset = 0) => {
    const response = await api.get(`/ports/${id}/switch-actions`, { params: { limit, offset } });
    return response.data;
  },
};

// Readings API
export const readingsAPI = {
  getReadingsByPort: async (portId, params = {}) => {
    const response = await api.get(`/readings/port/${portId}`, { params });
    return response.data;
  },
  
  getReading: async (id) => {
    const response = await api.get(`/readings/${id}`);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  
  getNotification: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },
  
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

// Schedules API
export const schedulesAPI = {
  getSchedules: async (params = {}) => {
    const response = await api.get('/schedules', { params });
    return response.data;
  },
  
  getSchedule: async (id) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },
  
  createSchedule: async (port, start_time, end_time, days, is_active) => {
    const response = await api.post('/schedules', { port, start_time, end_time, days, is_active });
    return response.data;
  },
  
  updateSchedule: async (id, data) => {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },
  
  deleteSchedule: async (id) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getMonthlyReport: async (year, month) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await api.get('/reports/monthly', { params });
    return response.data;
  },
};

export default api;

