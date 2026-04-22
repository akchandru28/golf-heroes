import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('gh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updatePassword = (data) => API.put('/auth/updatepassword', data);

// User
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (data) => API.put('/users/profile', data);
export const updateCharity = (data) => API.put('/users/charity', data);

// Scores
export const getMyScores = () => API.get('/scores/me');
export const addScore = (data) => API.post('/scores', data);
export const updateScore = (entryId, data) => API.put(`/scores/${entryId}`, data);
export const deleteScore = (entryId) => API.delete(`/scores/${entryId}`);

// Draws
export const getDraws = () => API.get('/draws');
export const getUpcomingDraw = () => API.get('/draws/upcoming');
export const getMyResults = () => API.get('/draws/my-results');
export const submitProof = (drawId, data) => API.post(`/draws/${drawId}/submit-proof`, data);

// Charities
export const getCharities = (params) => API.get('/charities', { params });
export const getCharity = (id) => API.get(`/charities/${id}`);

// Subscription (no payment gateway)
export const activateSubscription = (plan) => API.post('/subscription/activate', { plan });
export const cancelSubscription    = ()     => API.post('/subscription/cancel');
export const getSubscriptionStatus = ()     => API.get('/subscription/status');

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const getAdminUserDetail = (id) => API.get(`/admin/users/${id}`);
export const updateAdminUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const editUserScores = (id, data) => API.put(`/admin/users/${id}/scores`, data);
export const getAdminDraws = () => API.get('/admin/draws');
export const simulateDraw = (data) => API.post('/admin/draws/simulate', data);
export const publishDraw = (data) => API.post('/admin/draws/publish', data);
export const verifyWinner = (data) => API.post('/admin/draws/verify-winner', data);
export const getPendingVerifications = () => API.get('/admin/winners/pending');
export const createCharity = (data) => API.post('/charities', data);
export const updateCharityAdmin = (id, data) => API.put(`/charities/${id}`, data);
export const deleteCharity = (id) => API.delete(`/charities/${id}`);
