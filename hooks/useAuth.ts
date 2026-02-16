import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { UserProfile } from '../types';

interface FetcherError extends Error {
  info?: unknown;
  status?: number;
}

// Fetcher function
const fetcher = async (url: string): Promise<UserProfile> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error: FetcherError = new Error('An error occurred while fetching the data.');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export const useAuth = () => {
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Define public paths where we shouldn't fetch user data
  const publicPaths = ['/login', '/register'];
  const shouldFetch = !publicPaths.includes(router.pathname);

  const { data: user, error, mutate } = useSWR<UserProfile>(
    shouldFetch ? '/api/auth/me' : null,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  const login = async (data: Record<string, unknown>) => {
    setIsLoadingAuth(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw await res.json();

      const { accessToken, user: userData } = await res.json();
      localStorage.setItem('accessToken', accessToken);
      await mutate(userData, false); // Update SWR cache
      router.push('/dashboard');
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const register = async (data: Record<string, unknown>, redirectTo = '/login') => {
    setIsLoadingAuth(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw await res.json();

      if (redirectTo) {
        router.push(redirectTo);
      }
      return await res.json();
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('accessToken');
      await mutate(undefined, false);
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return {
    user,
    error,
    isLoading: !error && !user,
    isLoadingAuth,
    login,
    register,
    logout,
  };
};
