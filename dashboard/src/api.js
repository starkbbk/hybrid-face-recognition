import axios from 'axios';
import { io } from 'socket.io-client';

// Construct the API URL. 
// If VITE_API_URL is provided (by Render), use it. 
// Render 'host' property usually provides just the domain, so we ensure https:// is prepended.
const envUrl = import.meta.env.VITE_API_URL;
const API_URL = envUrl
  ? (envUrl.startsWith('http') ? envUrl : `https://${envUrl}`)
  : 'http://localhost:5001';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const socket = io(API_URL);

export const getStreamUrl = () => `${API_URL}/stream`;
