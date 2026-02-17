import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { AssignmentForm } from '../../components/organisms/AssignmentForm';
import { AsignacionFormData } from '../../types';
import { Card, CardContent } from '../../components/atoms/Card';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AsignacionFormData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/asignaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create assignment');
      }

      const createdAssignment = await response.json();
      router.push(`/asignaciones/${createdAssignment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/asignaciones');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crear Nueva Asignación</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Llenar el formulario a continuación para crear una nueva asignación. Todos los campos son obligatorios.
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
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}