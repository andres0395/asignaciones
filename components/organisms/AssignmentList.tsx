import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Asignacion } from '../../types';
import { Card, CardContent } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Pagination } from '../molecules/Pagination';
import { generatePDF } from '@/lib/pdf/generatePDF';

interface AssignmentListProps {
  assignments: Asignacion[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function AssignmentList({ 
  assignments, 
  loading = false, 
  onDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: AssignmentListProps) {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = (id: string) => {
    onDelete?.(id);
    setDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No assignments found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                <div className="flex-1 mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {assignment.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {assignment.month} - {assignment.semana}
                  </p>
                  {assignment.parent && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Parent: {assignment.parent.name} - {assignment.parent.semana}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/asignaciones/${assignment.id}`)}
                    className="w-auto px-3 py-1 text-sm"
                  >
                    Ver
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/asignaciones/${assignment.id}/edit`)}
                    className="w-auto px-3 py-1 text-sm"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => generatePDF(assignment)}
                    className="w-auto px-3 py-1 text-sm"
                  >
                    PDF
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteClick(assignment.id)}
                    className="w-auto px-3 py-1 text-sm"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Presidente:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {assignment.presidente?.fullName || 'Not assigned'}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Presidente Reunión:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {assignment.presidenteReunion?.fullName || 'Not assigned'}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Lector Reunión:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {assignment.lectorReunion?.fullName || 'Not assigned'}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Oración Final V/M:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {assignment.oracionFinalVM?.fullName || 'Not assigned'}
                  </p>
                </div>
              </div>

              {assignment._count && (
                <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {assignment._count.tesorosDeLaBiblia > 0 && (
                      <span>Tesoros de la Biblia: {assignment._count.tesorosDeLaBiblia}</span>
                    )}
                    {assignment._count.seamosMejoresMaestros > 0 && (
                      <span>Seamós Mejores Maestros: {assignment._count.seamosMejoresMaestros}</span>
                    )}
                    {assignment._count.nuestraVidaCristiana > 0 && (
                      <span>Nuestra Vida Cristiana: {assignment._count.nuestraVidaCristiana}</span>
                    )}
                    {assignment._count.children > 0 && (
                      <span>Child Assignments: {assignment._count.children}</span>
                    )}
                  </div>
                </div>
              )}

              {deleteConfirm === assignment.id && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-red-800 dark:text-red-300 mb-3">
                    Are you sure you want to delete this assignment? This action cannot be undone.
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="danger"
                      onClick={() => confirmDelete(assignment.id)}
                      className="w-auto px-3 py-1 text-sm"
                    >
                      Confirm Delete
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={cancelDelete}
                      className="w-auto px-3 py-1 text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}