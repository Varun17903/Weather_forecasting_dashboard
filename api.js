import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

export const getWeather = (city) =>
  axios.get(`${API_BASE}/weather`, { params: { city } }).then(res => res.data);

export const saveWeather = (data) =>
  axios.post(`${API_BASE}/saveWeather`, data);

export const getReport = (hours) =>
  axios.get(`${API_BASE}/report`, { params: { hours } }).then(res => res.data);
