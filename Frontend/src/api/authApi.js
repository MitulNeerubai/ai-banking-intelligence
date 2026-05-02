import apiClient from './apiClient';

export const authApi = {
  async register(username, email, password) {
    const res = await apiClient.post('/register', { username, email, password });
    return res.data;
  },

  async login(email, password) {
    const res = await apiClient.post('/login', { email, password });
    return res.data;
  },

  async verifyToken() {
    const res = await apiClient.get('/protected');
    return res.data;
  },

  async getProfile() {
    const res = await apiClient.get('/profile');
    return res.data; // { id, username, email }
  },
};
