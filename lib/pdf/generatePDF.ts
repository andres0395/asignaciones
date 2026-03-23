import { Asignacion } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const colors = {
  gray: [111, 111, 111] as [number, number, number],
  gold: [207, 160, 7] as [number, number, number],
  red: [158, 11, 15] as [number, number, number],
  blue: [43, 89, 161] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
  white: [255, 255, 255] as [number, number, number]
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function renderAssignment(doc: jsPDF, assignment: Asignacion, startY: number) {
  const topMargin = 10;
  const bottomMargin = 10;
  const pageHeight = doc.internal.pageSize.getHeight();

  const ensureSpace = (currentY: number, needed: number) => {
    if (currentY + needed <= pageHeight - bottomMargin) return currentY;
    doc.addPage();
    return topMargin;
  };

  startY = ensureSpace(startY, 30);

  autoTable(doc, {
    head: [[
      { content: `${assignment.semana}_ ${assignment.name}`, styles: { fontStyle: 'bold' as const, halign: 'left' as const } },
      { content: 'PRESIDENTE:', styles: { fontStyle: 'bold' as const, halign: 'right' as const } },
      { content: assignment.presidente?.fullName || '', styles: { fontStyle: 'bold' as const, halign: 'left' as const } }
    ]],
    theme: 'plain',
    startY,
    styles: { lineColor: [200, 200, 200], lineWidth: 0.1, textColor: colors.black },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40 },
      2: { cellWidth: 'auto' }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = (doc as any).lastAutoTable.finalY + 5;

  finalY = ensureSpace(finalY, 18);

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

  finalY = ensureSpace(finalY, 18);

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

  finalY = ensureSpace(finalY, 18);

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

  finalY = ensureSpace(finalY, 26);
  const startYBottom = finalY;
  
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  finalY = Math.max((doc as any).lastAutoTable.finalY, startYBottom) + 8;

  finalY = ensureSpace(finalY, 6);
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.2);
  doc.line(14, finalY, 196, finalY);

  return finalY + 6;
}

export const generatePDF = async (assignment: Asignacion): Promise<Blob | null> => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('La generación de PDF requiere el navegador');
    }

    if (!assignment.month) {
      throw new Error('La asignación no tiene mes');
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No autorizado');
    }

    const url = new URL('/api/asignaciones', window.location.origin);
    url.searchParams.set('month', assignment.month);
    url.searchParams.set('forPdf', '1');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      const message = typeof errorBody?.message === 'string' ? errorBody.message : 'No se pudieron obtener las asignaciones del mes';
      throw new Error(message);
    }

    const payload = (await res.json()) as { data?: Asignacion[] };
    const assignments = Array.isArray(payload.data) ? payload.data : [];

    if (assignments.length === 0) {
      throw new Error('No existen asignaciones en el mes especificado');
    }

    const MAX_ASSIGNMENTS = 30;
    if (assignments.length > MAX_ASSIGNMENTS) {
      throw new Error('Demasiadas asignaciones para generar un PDF único');
    }

    const doc = new jsPDF();
    let cursorY = 10;
    for (let i = 0; i < assignments.length; i += 1) {
      cursorY = renderAssignment(doc, assignments[i], cursorY);
    }

    const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer;
    const MAX_PDF_BYTES = 12 * 1024 * 1024;
    if (arrayBuffer.byteLength > MAX_PDF_BYTES) {
      throw new Error('El PDF resultante excede un tamaño razonable');
    }

    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const filename = `asignaciones-${assignment.month}.pdf`;
    downloadBlob(blob, filename);

    return blob;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error generando el PDF';
    if (typeof window !== 'undefined') {
      window.alert(message);
    }
    return null;
  }
};
