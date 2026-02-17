import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AssignmentForm } from '../../../components/organisms/AssignmentForm';
import { AsignacionFormData, Asignacion } from '../../../types';
import { Card, CardContent } from '../../../components/atoms/Card';
import { Button } from '../../../components/atoms/Button';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';

export default function EditAssignmentPage() {
  const {user} = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [assignment, setAssignment] = useState<Asignacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const transformAssignmentToFormData = (assignment: Asignacion): AsignacionFormData => {
    return {
      name: assignment.name,
      semana: assignment.semana,
      month: assignment.month,
      parentId: assignment.parentId || undefined,
      presidenteId: assignment.presidenteId || undefined,
      presidenteReunionId: assignment.presidenteReunionId || undefined,
      lectorReunionId: assignment.lectorReunionId || undefined,
      oracionFinalVMId: assignment.oracionFinalVMId || undefined,
      oracionFinalPublicaId: assignment.oracionFinalPublicaId || undefined,
      tesorosDeLaBiblia: assignment.tesorosDeLaBiblia.map(item => ({
        name: item.name,
        minutos: item.minutos,
        encargadoId: item.encargadoId || undefined
      })),
      seamosMejoresMaestros: assignment.seamosMejoresMaestros.map(item => ({
        name: item.name,
        minutos: item.minutos,
        encargadoId: item.encargadoId || undefined
      })),
      nuestraVidaCristiana: assignment.nuestraVidaCristiana.map(item => ({
        name: item.name,
        minutos: item.minutos,
        encargadoId: item.encargadoId || undefined
      }))
    };
  };

  const handleSubmit = async (data: AsignacionFormData) => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/asignaciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update assignment');
      }

      router.push(`/asignaciones/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (id) {
      router.push(`/asignaciones/${id}`);
    } else {
      router.push('/asignaciones');
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
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => router.push(`/asignaciones/${id}`)}
            className="w-auto mb-4 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Assignment
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Assignment</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update the assignment details below. All fields are required.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <Card>
          <CardContent>
            <AssignmentForm
              initialData={transformAssignmentToFormData(assignment)}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={saving}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}