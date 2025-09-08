// Centralized API base URL for frontend requests
// Priority:
// 1) REACT_APP_API_BASE env (set in Vercel/CI)
// 2) localhost dev fallback
// 3) relative "/api" when deployed behind a reverse proxy

const getApiBase = () => {
  const fromEnv = process.env.REACT_APP_API_BASE;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim().length) {
    return fromEnv.replace(/\/$/, '');
  }

  // If running locally, default to the dev server
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3003/api';
    }
  }

  // Default for production: assume same-origin /api
  return '/api';
};

const API_BASE = getApiBase();

export default API_BASE;
