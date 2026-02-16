import { useEffect } from 'react';

// Refresh token check interval (e.g. every 14 minutes if token lasts 15m)
const REFRESH_INTERVAL = 14 * 60 * 1000;

export const useRefreshToken = () => {
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
        });

        if (res.ok) {
          const { accessToken } = await res.json();
          localStorage.setItem('accessToken', accessToken);
          // Optionally trigger SWR revalidation or event if needed
        } else {
          // If refresh fails (e.g. token expired), we might want to logout user or do nothing (let next auth call fail)
          // For now, silently fail.
        }
      } catch (error) {
        console.error('Failed to refresh token', error);
      }
    };

    // Initial check or setup interval
    // We assume we have an access token on mount if user is logged in.
    // But we don't know when it expires exactly without decoding it.
    // Simpler approach: Setup interval to refresh periodically.
    refresh();
    const intervalId = setInterval(refresh, REFRESH_INTERVAL);

    // Also try to refresh on mount if we think we are logged in? 
    // Maybe better to rely on 401 interceptor, but prompt asked for automatic renewal.
    // Creating a silent refresh on mount involves checking validity.

    return () => clearInterval(intervalId);
  }, []);
};
