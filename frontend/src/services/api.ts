import axios from 'axios';

// API URL - check localStorage first, then env, then default
const getApiUrl = () => {
  if (typeof window !== 'undefined' && localStorage.getItem('api_url')) {
    return localStorage.getItem('api_url')!;
  }
  return import.meta.env.VITE_API_URL || 'https://ai-radio-api.onrender.com/api';
};

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Changed for cross-origin requests
  timeout: 30000, // 30 second timeout for slower free tier
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch {
        // Invalid token format
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.patch('/auth/profile', data),
};

// Content API
export const contentApi = {
  getAll: (params?: { page?: number; limit?: number; type?: string }) =>
    api.get('/content', { params }),
  getById: (id: string) => api.get(`/content/${id}`),
  upload: (formData: FormData, onProgress?: (progress: number) => void) =>
    api.post('/content/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    }),
  createFromText: (data: { title: string; text: string }) =>
    api.post('/content/text', data),
  createFromUrl: (data: { url: string; title?: string }) =>
    api.post('/content/url', data),
  delete: (id: string) => api.delete(`/content/${id}`),
  process: (id: string) => api.post(`/content/${id}/process`),
};

// Radio API
export const radioApi = {
  getShows: (params?: { channel?: string; page?: number; limit?: number }) =>
    api.get('/radio/shows', { params }),
  getShowById: (id: string) => api.get(`/radio/shows/${id}`),
  getCurrentShow: (channelId: string) =>
    api.get(`/radio/channels/${channelId}/current`),
  getUpcoming: (channelId: string) =>
    api.get(`/radio/channels/${channelId}/upcoming`),
  generateShow: (data: {
    contentIds: string[];
    format: string;
    duration?: number;
  }) => api.post('/radio/shows/generate', data),
  getNudges: (params?: { page?: number; limit?: number }) =>
    api.get('/radio/nudges', { params }),
};

// Music API
export const musicApi = {
  searchYouTube: (query: string) =>
    api.get('/music/youtube/search', { params: { q: query } }),
  getYouTubeVideo: (videoId: string) =>
    api.get(`/music/youtube/video/${videoId}`),
  searchSpotify: (query: string, type?: string) =>
    api.get('/music/spotify/search', { params: { q: query, type } }),
  getSpotifyPlaylists: () => api.get('/music/spotify/playlists'),
  getSpotifyTrack: (trackId: string) =>
    api.get(`/music/spotify/track/${trackId}`),
  getPlaylists: () => api.get('/music/playlists'),
  createPlaylist: (data: { name: string; isPublic?: boolean }) =>
    api.post('/music/playlists', data),
  addToPlaylist: (playlistId: string, track: object) =>
    api.post(`/music/playlists/${playlistId}/tracks`, track),
  removeFromPlaylist: (playlistId: string, trackId: string) =>
    api.delete(`/music/playlists/${playlistId}/tracks/${trackId}`),
};

// Research API
export const researchApi = {
  search: (query: string, mode: 'deep' | 'wide' = 'wide') =>
    api.get('/research/search', { params: { q: query, mode } }),
  saveResult: (data: { query: string; results: object[] }) =>
    api.post('/research/save', data),
};

// User API
export const userApi = {
  getHistory: (params?: { page?: number; limit?: number }) =>
    api.get('/user/history', { params }),
  getLikes: () => api.get('/user/likes'),
  toggleLike: (contentId: string) => api.post(`/user/likes/${contentId}`),
  getSubscriptions: () => api.get('/user/subscriptions'),
  subscribe: (topicId: string) => api.post(`/user/subscriptions/${topicId}`),
  unsubscribe: (topicId: string) =>
    api.delete(`/user/subscriptions/${topicId}`),
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (data: object) => api.patch('/user/preferences', data),
  getFeed: (params?: { page?: number; limit?: number }) =>
    api.get('/user/feed', { params }),
};

// Topics API
export const topicsApi = {
  getAll: () => api.get('/topics'),
  getById: (id: string) => api.get(`/topics/${id}`),
};

// Google API
export const googleApi = {
  getAuthUrl: () => api.get('/integrations/google/auth-url'),
  callback: (code: string) =>
    api.post('/integrations/google/callback', { code }),
  getDocs: () => api.get('/integrations/google/docs'),
  getSheets: () => api.get('/integrations/google/sheets'),
  importDoc: (docId: string) =>
    api.post('/integrations/google/docs/import', { docId }),
  importSheet: (sheetId: string) =>
    api.post('/integrations/google/sheets/import', { sheetId }),
};

// Spotify Auth API
export const spotifyAuthApi = {
  getAuthUrl: () => api.get('/integrations/spotify/auth-url'),
  callback: (code: string) =>
    api.post('/integrations/spotify/callback', { code }),
  disconnect: () => api.post('/integrations/spotify/disconnect'),
  getStatus: () => api.get('/integrations/spotify/status'),
};

export default api;
