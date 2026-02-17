import { useState, useCallback, useRef } from 'react';
import { SearchUser } from '../types';

interface UseUserSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
}

interface UseUserSearchReturn {
  users: SearchUser[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  clear: () => void;
  hasMore: boolean;
  loadMore: () => void;
}

export function useUserSearch(options: UseUserSearchOptions = {}): UseUserSearchReturn {
  const { debounceMs = 300, minQueryLength = 2 } = options;
  
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchUsers = useCallback(async (query: string, page: number, append: boolean = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      
      if (append) {
        setUsers(prev => [...prev, ...data.data]);
      } else {
        setUsers(data.data);
        setCurrentPage(1);
      }
      
      setHasMore(data.meta.page < data.meta.totalPages);
      
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback((query: string) => {
    setCurrentQuery(query);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Clear users if query is too short
    if (query.trim().length < minQueryLength) {
      setUsers([]);
      setHasMore(false);
      return;
    }
    
    // Set new debounce
    debounceRef.current = setTimeout(() => {
      fetchUsers(query.trim(), 1, false);
    }, debounceMs);
  }, [debounceMs, minQueryLength, fetchUsers]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || !currentQuery) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchUsers(currentQuery, nextPage, true);
  }, [hasMore, loading, currentQuery, currentPage, fetchUsers]);

  const clear = useCallback(() => {
    setUsers([]);
    setCurrentQuery('');
    setCurrentPage(1);
    setHasMore(false);
    setError(null);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    users,
    loading,
    error,
    search,
    clear,
    hasMore,
    loadMore
  };
}