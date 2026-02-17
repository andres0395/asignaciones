import React, { useState, useRef, useEffect } from 'react';
import { useUserSearch } from '../../hooks/useUserSearch';
import { SearchUser } from '../../types';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';

interface UserSelectorProps {
  value?: string;
  onChange: (userId: string | undefined, user: SearchUser | undefined) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
}

export function UserSelector({ 
  value, 
  onChange, 
  placeholder = "Search users...", 
  label,
  error,
  required = false 
}: UserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const { users, loading, error: searchError, search, clear, hasMore, loadMore } = useUserSearch({
    debounceMs: 300,
    minQueryLength: 2
  });

  // Load selected user data if value is provided
  useEffect(() => {
    if (value && !query) {
      // This would ideally fetch the user data, but for now we'll just show the ID
      // In a real app, you might want to fetch the user details
    }
  }, [query, value]);

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (user: SearchUser) => {
    onChange(user.id, user);
    setQuery(user.fullName);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(undefined, undefined);
    setQuery('');
    clear();
  };

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !loading) {
        loadMore();
      }
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          error={!!error}
        />
        
        {value && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden dark:bg-neutral-800 dark:border-neutral-700">
          <div 
            ref={listRef}
            className="overflow-y-auto max-h-60"
            onScroll={handleScroll}
          >
            {loading && users.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm dark:text-gray-400">Searching...</div>
            ) : searchError ? (
              <div className="px-3 py-2 text-red-500 text-sm">{searchError}</div>
            ) : users.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm dark:text-gray-400">
                {query.length < 2 ? 'Type at least 2 characters to search' : 'No users found'}
              </div>
            ) : (
              <>
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    {user.phone && (
                      <div className="text-xs text-gray-400 dark:text-gray-500">{user.phone}</div>
                    )}
                  </button>
                ))}
                {hasMore && (
                  <div className="px-3 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                    {loading ? 'Loading more...' : 'Scroll for more results'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}