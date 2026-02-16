import { TableHeader } from '../atoms/TableHeader';
import { TableRow, Column } from '../molecules/TableRow';

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (data: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  isLoading,
  emptyMessage = 'No data available'
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-gray-500 animate-pulse">
        Loading data...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-32 flex items-center justify-center text-gray-500 border rounded-lg">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-neutral-700">
        <thead className="bg-gray-50 dark:bg-neutral-900">
          <tr>
            {columns.map((column, index) => (
              <TableHeader key={index} scope="col">
                {column.header}
              </TableHeader>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700 bg-white dark:bg-neutral-800">
          {data.map((row) => (
            <TableRow
              key={row.id}
              data={row}
              columns={columns}
              onRowClick={onRowClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
