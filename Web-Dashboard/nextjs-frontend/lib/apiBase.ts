export function getApiBase(): string {
  // In Next.js, environment variables need the NEXT_PUBLIC_ prefix to be accessible in the browser
  if (process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }
  
  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3003/api';
  }
  
  // Production fallback - relative path that will be handled by Next.js rewrites
  return '/api';
}
