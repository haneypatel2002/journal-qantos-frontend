import axios from 'axios';

// Updated to your local IP address for mobile testing
// (This also bypasses the code-tunnel error)
const API_BASE_URL = 'http://192.168.1.50:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const userAPI = {
  create: (name: string) => api.post('/users', { name }),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: { name?: string }) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Journal API
export const journalAPI = {
  create: (data: { userId: string; date: string; mood: string; content: string }) =>
    api.post('/journal', data),
  getAll: (userId: string) => api.get(`/journal/${userId}`),
  getByDate: (userId: string, date: string) => api.get(`/journal/${userId}/${date}`),
  update: (id: string, data: { mood?: string; content?: string }) =>
    api.put(`/journal/${id}`, data),
  getMoodData: (userId: string, months?: number) =>
    api.get(`/journal/${userId}/mood-data`, { params: { months } }),
};

// Challenge API
export const challengeAPI = {
  getSuggestions: (userId: string) => api.get(`/challenges/suggestions/${userId}`),
  start: (data: { userId: string; category: string }) => api.post('/challenges', data),
  getAll: (userId: string) => api.get(`/challenges/${userId}`),
  completeDay: (challengeId: string, day: number, note?: string) =>
    api.put(`/challenges/${challengeId}/day/${day}`, { note }),
};

export default api;
