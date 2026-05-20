import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getSeedData = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const res = await axios.get(`${API_URL}/api/seed`, config);
  return res.data;
};

export const logSeedEvent = async (token, status, date) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const res = await axios.post(`${API_URL}/api/seed/log`, { status, log_date: date }, config);
  return res.data;
};
