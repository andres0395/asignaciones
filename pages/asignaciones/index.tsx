import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AssignmentList } from '../../components/organisms/AssignmentList';
import { Asignacion } from '../../types';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const fetchAssignments = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/asignaciones?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data.data);
      setTotalPages(data.meta.totalPages);
      setCurrentPage(data.meta.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/asignaciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.dependencies) {
          alert(`Cannot delete assignment: ${errorData.message}`);
          return;
        }
        throw new Error('Failed to delete assignment');
      }

      // Refresh the list
      fetchAssignments(currentPage, searchTerm);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete assignment');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssignments(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAssignments(page, searchTerm);
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout user={user}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
            <Button
              onClick={() => router.push('/asignaciones/create')}
              className="w-full sm:w-auto px-4 py-2"
            >
              Crear Nueva Asignación 
            </Button>
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search assignments..."
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-auto px-6"
                >
                  Search
                </Button>
                {searchTerm && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('');
                      fetchAssignments(1, '');
                    }}
                    className="w-auto px-6"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        <AssignmentList
          assignments={assignments}
          loading={loading}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </DashboardLayout>
  );
}