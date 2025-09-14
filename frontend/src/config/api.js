// frontend/src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5030';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5030';

export { API_BASE_URL, SOCKET_URL };
