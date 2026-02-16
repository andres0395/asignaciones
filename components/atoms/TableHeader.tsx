import { ThHTMLAttributes, ReactNode } from 'react';

interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export const TableHeader = ({ children, className = '', ...props }: TableHeaderProps) => {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};
