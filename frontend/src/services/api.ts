import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; displayName?: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (data: any) => api.put('/user/preferences', data),
  getHistory: () => api.get('/user/history'),
  addToHistory: (data: any) => api.post('/user/history', data),
};

// Content API
export const contentAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/content/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addText: (data: { title: string; text: string }) =>
    api.post('/content/text', data),
  addUrl: (url: string) => api.post('/content/url', { url }),
  list: (params?: any) => api.get('/content', { params }),
  get: (id: string) => api.get(`/content/${id}`),
  update: (id: string, data: any) => api.put(`/content/${id}`, data),
  delete: (id: string) => api.delete(`/content/${id}`),
  search: (query: string) => api.post('/content/search', { query }),
};

// Radio Show API
export const radioAPI = {
  generate: (data: { showType: string; contentIds?: string[]; title?: string }) =>
    api.post('/shows/generate', data),
  list: (params?: any) => api.get('/shows', { params }),
  get: (id: string) => api.get(`/shows/${id}`),
  delete: (id: string) => api.delete(`/shows/${id}`),
  getAudioUrl: (id: string) => `${API_URL}/shows/${id}/audio`,
  getLiveStream: () => api.get('/radio/live/stream'),
};

// Music API
export const musicAPI = {
  search: (query: string) => api.get('/music/search', { params: { query } }),
  searchYouTube: (query: string) => api.get('/music/youtube/search', { params: { query } }),
  searchSpotify: (query: string) => api.get('/music/spotify/search', { params: { query } }),
};

// Recommendations API
export const recommendationsAPI = {
  getShows: () => api.get('/recommendations/shows'),
  getContent: () => api.get('/recommendations/content'),
};

export default api;
