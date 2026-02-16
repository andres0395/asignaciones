import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-2 bg-white dark:bg-neutral-900 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-gray-300 dark:border-neutral-700 focus:border-black dark:focus:border-white focus:ring-gray-200 dark:focus:ring-neutral-800'
          } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
