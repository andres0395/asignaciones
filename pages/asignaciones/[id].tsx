import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AssignmentDetail } from '../../components/organisms/AssignmentDetail';
import { Asignacion } from '../../types';
import { DashboardLayout } from '../../components/templates/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/atoms/Button';

export default function AssignmentDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [assignment, setAssignment] = useState<Asignacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/asignaciones/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          if (response.status === 404) {
            router.push('/asignaciones');
            return;
          }
          throw new Error('Failed to fetch assignment');
        }

        const data = await response.json();
        setAssignment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assignment');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssignment();
    }
  }, [id, router]);

  const handleDelete = async () => {
    if (!assignment) return;

    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

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

      router.push('/asignaciones');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete assignment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <DashboardLayout user={user}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/20 dark:border-red-800">
            <h1 className="text-lg font-semibold text-red-800 mb-2 dark:text-red-300">Error</h1>
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <Button
              variant="primary"
              onClick={() => router.push('/asignaciones')}
              className="mt-4 w-auto"
            >
              Back to Assignments
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => router.push('/asignaciones')}
            className="w-auto mb-4 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Assignments
          </Button>
          
          <AssignmentDetail 
            assignment={assignment} 
            onDelete={handleDelete}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}