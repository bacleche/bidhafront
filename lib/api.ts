import axios from 'axios';

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
// Assurez-vous que l'URL ne finit pas par un slash pour éviter les doubles //
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bidhaback-production.up.railway.app/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});


export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://bidhaback-production.up.railway.app/api').replace('/api', '');
  return `${base}${path}`;
};
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  auth: { 
    login: '/auth/login/', 
    register: '/auth/register/', 
    profile: '/auth/profile/',
  },
  clientStats: 'client-stats/',
  agencies: '/agencies/', 
  agenciesMine: '/agencies/mine/', 
  agents: '/agents/',
  properties: '/properties/', 
  propertiesFeatured: '/properties/featured/', 
  propertiesStats: '/properties/stats/',
  transactions: '/transactions/', 
  transactionsStats: '/transactions/stats/',
  contracts: '/contracts/',
  clients: '/clients/',

   contactRequests: '/contact-requests/',
  visitRequests: '/visit-requests/',
  complaints: '/complaints/',
  notifications: '/notifications/',
};

