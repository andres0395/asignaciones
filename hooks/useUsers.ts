import useSWR from 'swr';
import { useState } from 'react';
import { UserProfile } from '../types';

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsersResponse {
  data: UserProfile[];
  meta: Meta;
}

// Fetcher
const fetcher = async (url: string): Promise<UsersResponse> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export const useUsers = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    `/api/users?page=${page}&limit=${limit}`,
    fetcher,
    {
      keepPreviousData: true, // Keep data while fetching new page
    }
  );

  return {
    users: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    mutate,
  };
};
