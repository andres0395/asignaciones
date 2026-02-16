import { forwardRef, InputHTMLAttributes } from 'react';
import { Label } from '../atoms/Label';
import { Input } from '../atoms/Input';
import { ErrorMessage } from '../atoms/ErrorMessage';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={`mb-4 ${className}`}>
        <Label htmlFor={props.id}>{label}</Label>
        <Input ref={ref} error={!!error} {...props} />
        <ErrorMessage>{error}</ErrorMessage>
      </div>
    );
  }
);

FormField.displayName = 'FormField';
