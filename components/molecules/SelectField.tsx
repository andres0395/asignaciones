import { forwardRef, SelectHTMLAttributes } from 'react';
import { Label } from '../atoms/Label';
import { Select } from '../atoms/Select';
import { ErrorMessage } from '../atoms/ErrorMessage';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className={`mb-4 ${className}`}>
        <Label htmlFor={props.id}>{label}</Label>
        <div className="relative">
          <Select ref={ref} error={!!error} {...props}>
            {children}
          </Select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <ErrorMessage>{error}</ErrorMessage>
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
