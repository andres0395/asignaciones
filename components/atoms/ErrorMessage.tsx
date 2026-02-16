import { ReactNode } from 'react';

interface ErrorMessageProps {
  children?: ReactNode;
  className?: string;
}

export const ErrorMessage = ({ children, className = '' }: ErrorMessageProps) => {
  if (!children) return null;

  return (
    <p className={`text-sm text-red-500 mt-1 animate-fadeIn ${className}`}>
      {children}
    </p>
  );
};
