import { TdHTMLAttributes, ReactNode } from 'react';

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export const TableCell = ({ children, className = '', ...props }: TableCellProps) => {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};
