import { ReactNode } from 'react';
import { TableCell } from '../atoms/TableCell';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string; // For custom cell styling
}

interface TableRowProps<T> {
  data: T;
  columns: Column<T>[];
  onRowClick?: (data: T) => void;
}

export function TableRow<T>({ data, columns, onRowClick }: TableRowProps<T>) {
  return (
    <tr
      className={`bg-white dark:bg-neutral-800 border-b dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
      onClick={() => onRowClick && onRowClick(data)}
    >
      {columns.map((column, index) => (
        <TableCell key={index} className={column.className}>
          {typeof column.accessor === 'function'
            ? column.accessor(data)
            : (data[column.accessor] as ReactNode)}
        </TableCell>
      ))}
    </tr>
  );
}
