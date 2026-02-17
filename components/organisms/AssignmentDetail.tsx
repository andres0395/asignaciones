import React from 'react';
import { useRouter } from 'next/router';
import { Asignacion, AssignmentItem } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { Button } from '../atoms/Button';
import Link from 'next/link';

interface AssignmentDetailProps {
  assignment: Asignacion;
  onDelete?: () => void;
}

export function AssignmentDetail({ assignment, onDelete }: AssignmentDetailProps) {
  const router = useRouter();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAssignmentItems = (items: AssignmentItem[], title: string) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id || index} className="p-4 bg-gray-50 rounded-lg dark:bg-neutral-800">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Duration: {item.minutos} minutes
                  </p>
                  {item.encargado && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Encargado: {item.encargado.fullName} ({item.encargado.email})
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUserAssignment = (label: string, user?: { fullName: string; email: string }) => (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</h4>
      {user ? (
        <div className="mt-1">
          <p className="text-gray-900 dark:text-white">{user.fullName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
        </div>
      ) : (
        <p className="text-gray-500 italic dark:text-gray-500">Not assigned</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle className="text-2xl">{assignment.name}</CardTitle>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {assignment.month} - {assignment.semana}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => router.push(`/asignaciones/${assignment.id}/edit`)}
              className="w-auto px-4 py-2"
            >
              Edit
            </Button>
            {onDelete && (
              <Button
                variant="danger"
                onClick={onDelete}
                className="w-auto px-4 py-2"
              >
                Delete
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <dl className="divide-y divide-gray-200 dark:divide-neutral-700">
            <div className="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 dark:bg-neutral-800/50">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                {formatDate(assignment.createdAt)}
              </dd>
            </div>
            
            <div className="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 dark:bg-neutral-800">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                {formatDate(assignment.updatedAt)}
              </dd>
            </div>

            {assignment.parent && (
              <div className="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 dark:bg-neutral-800/50">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Parent Assignment</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                  <Link 
                    href={`/asignaciones/${assignment.parent.id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {assignment.parent.name} - {assignment.parent.semana}
                  </Link>
                </dd>
              </div>
            )}
          </dl>

          <div className="px-6 py-6 border-t border-gray-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">User Assignments</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderUserAssignment('Presidente', assignment.presidente)}
              {renderUserAssignment('Presidente Reunión', assignment.presidenteReunion)}
              {renderUserAssignment('Lector Reunión', assignment.lectorReunion)}
              {renderUserAssignment('Oración Final V/M', assignment.oracionFinalVM)}
              {renderUserAssignment('Oración Final Pública', assignment.oracionFinalPublica)}
            </div>
          </div>

          <div className="px-6 py-6 border-t border-gray-200 dark:border-neutral-700">
            {renderAssignmentItems(assignment.tesorosDeLaBiblia, 'Tesoros de la Biblia')}
            {renderAssignmentItems(assignment.seamosMejoresMaestros, 'Seamós Mejores Maestros')}
            {renderAssignmentItems(assignment.nuestraVidaCristiana, 'Nuestra Vida Cristiana')}
          </div>

          {assignment.children && assignment.children.length > 0 && (
            <div className="px-6 py-6 border-t border-gray-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Child Assignments</h2>
              <div className="space-y-3">
                {assignment.children.map((child) => (
                  <div key={child.id} className="p-4 bg-gray-50 rounded-lg dark:bg-neutral-800">
                    <Link 
                      href={`/asignaciones/${child.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {child.name}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{child.semana}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Created: {formatDate(child.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}