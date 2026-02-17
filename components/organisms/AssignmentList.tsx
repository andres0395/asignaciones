import React, { useState } from 'react';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Asignacion } from '../../types';
import { Card, CardContent } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Pagination } from '../molecules/Pagination';

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

  const generatePDF = (assignment: Asignacion) => {
    const doc = new jsPDF();
    
    // Helper for colors
    const colors = {
      gray: [111, 111, 111] as [number, number, number],
      gold: [207, 160, 7] as [number, number, number],
      red: [158, 11, 15] as [number, number, number],
      blue: [43, 89, 161] as [number, number, number],
      black: [0, 0, 0] as [number, number, number],
      white: [255, 255, 255] as [number, number, number]
    };

    // Header Table
    autoTable(doc, {
      head: [[
        { content: `${assignment.semana}_ ${assignment.name}`, styles: { fontStyle: 'bold' as const, halign: 'left' as const } },
        { content: 'PRESIDENTE:', styles: { fontStyle: 'bold' as const, halign: 'right' as const } },
        { content: assignment.presidente?.fullName || '', styles: { fontStyle: 'bold' as const, halign: 'left' as const } }
      ]],
      theme: 'plain',
      styles: { lineColor: [200, 200, 200], lineWidth: 0.1, textColor: colors.black },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40 },
        2: { cellWidth: 'auto' }
      },
      margin: { top: 10 }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let finalY = (doc as any).lastAutoTable.finalY + 5;

    // Tesoros Section
    doc.setFillColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.rect(14, finalY, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TESOROS DE LA BIBLIA', 105, finalY + 5.5, { align: 'center' });
    
    finalY += 10;

    if (assignment.tesorosDeLaBiblia?.length) {
      const data = assignment.tesorosDeLaBiblia.map((item, index) => [
        { content: `${item.minutos} min: (${index + 1})`, styles: { textColor: colors.blue, fontStyle: 'bold' as const } },
        { content: item.name, styles: { textColor: colors.blue } },
        { content: item.encargado?.fullName || '', styles: { textColor: colors.blue, halign: 'right' as const } }
      ]);

      autoTable(doc, {
        body: data,
        startY: finalY,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 50 }
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalY = (doc as any).lastAutoTable.finalY + 5;
    }

    // Seamos Mejores Maestros Section
    doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    doc.rect(14, finalY, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SEAMOS MEJORES MAESTROS', 105, finalY + 5.5, { align: 'center' });
    
    finalY += 10;

    if (assignment.seamosMejoresMaestros?.length) {
      const startIndex = (assignment.tesorosDeLaBiblia?.length || 0) + 1;
      const data = assignment.seamosMejoresMaestros.map((item, index) => [
        { content: `${item.minutos} min: (${startIndex + index})`, styles: { textColor: colors.gold, fontStyle: 'bold' as const } },
        { content: item.name, styles: { textColor: colors.gold, fontStyle: 'bold' as const } },
        { content: item.encargado?.fullName || '', styles: { textColor: colors.gold, halign: 'right' as const } }
      ]);

      autoTable(doc, {
        body: data,
        startY: finalY,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 50 }
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalY = (doc as any).lastAutoTable.finalY + 5;
    }

    // Nuestra Vida Cristiana Section
    doc.setFillColor(colors.red[0], colors.red[1], colors.red[2]);
    doc.rect(14, finalY, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NUESTRA VIDA CRISTIANA', 105, finalY + 5.5, { align: 'center' });
    
    finalY += 10;

    if (assignment.nuestraVidaCristiana?.length) {
      const startIndex = (assignment.tesorosDeLaBiblia?.length || 0) + (assignment.seamosMejoresMaestros?.length || 0) + 1;
      const data = assignment.nuestraVidaCristiana.map((item, index) => [
        { content: `${item.minutos} min: (${startIndex + index})`, styles: { textColor: colors.red, fontStyle: 'bold' as const } },
        { content: item.name, styles: { textColor: colors.red } },
        { content: item.encargado?.fullName || '', styles: { textColor: colors.red, halign: 'right' as const } }
      ]);

      autoTable(doc, {
        body: data,
        startY: finalY,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 50 }
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Bottom Tables
    const startYBottom = finalY;
    
    // Left Box
    autoTable(doc, {
      body: [
        ['Oración final V/ M.', assignment.oracionFinalVM?.fullName || ''],
        ['Oración final R/Publica', assignment.oracionFinalPublica?.fullName || '']
      ],
      startY: startYBottom,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2, lineColor: [220, 220, 220], textColor: colors.black },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' as const },
        1: { cellWidth: 45 }
      },
      margin: { right: 105 }
    });
    
    // Right Box
    autoTable(doc, {
      body: [
        ['Presidencia Reunión Publica', assignment.presidenteReunion?.fullName || ''],
        ['Lector Reunión', assignment.lectorReunion?.fullName || '']
      ],
      startY: startYBottom,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2, lineColor: [220, 220, 220], textColor: colors.black },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' as const },
        1: { cellWidth: 40 }
      },
      margin: { left: 110 }
    });

    doc.save(`assignment-${assignment.semana}.pdf`);
  };

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
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/asignaciones/${assignment.id}/edit`)}
                    className="w-auto px-3 py-1 text-sm"
                  >
                    Edit
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
                    Delete
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