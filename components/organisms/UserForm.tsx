import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../hooks/useAuth';
import { FormField } from '../molecules/FormField';
import { PasswordField } from '../molecules/PasswordField';
import { Button } from '../atoms/Button';
import { SelectField } from '../molecules/SelectField';
import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { UserProfile } from '../../types';

interface UserFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  initialData?: Partial<UserProfile>; // For edit mode
  isEditMode?: boolean;
  isAdmin?: boolean; // New prop to indicate admin context
}

export const UserForm = ({ onSuccess, redirectTo = '/login', initialData, isEditMode = false, isAdmin = false }: UserFormProps) => {
  const { register: registerUser, isLoadingAuth } = useAuth();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic schema based on mode
  const schema = yup.object().shape({
    fullName: yup.string().required('Full name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().required('Phone number is required'),
    password: isEditMode
      ? yup.string().min(6, 'Password must be at least 6 characters') // Optional in edit
      : yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: isEditMode
      ? yup.string().oneOf([yup.ref('password')], 'Passwords must match')
      : yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
    role: isAdmin ? yup.string().oneOf(['admin', 'viewer']).default('viewer') : yup.string(),
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    schema,
  });

  useEffect(() => {
    if (initialData) {
      setValue('fullName', initialData.fullName || '');
      setValue('email', initialData.email || '');
      setValue('phone', initialData.phone || '');
      if (isAdmin && initialData.role) {
        setValue('role', initialData.role);
      }
    }
  }, [initialData, setValue, isAdmin]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      setServerError('');

      if (isEditMode && initialData?.id) {
        // Update Logic
        const res = await fetch(`/api/users/${initialData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw await res.json();
      } else if (isAdmin) {
        // Admin Create Logic
        const res = await fetch(`/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw await res.json();
      } else {
        // Public Register Logic
        await registerUser(data, redirectTo);
      }

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setServerError((err as { message: string }).message);
      } else {
        setServerError('Operation failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
      <FormField
        label="Nombre completo"
        id="fullName"
        placeholder="John Doe"
        error={errors.fullName?.message as string}
        {...register('fullName')}
      />
      <FormField
        label="Email"
        id="email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message as string}
        {...register('email')}
      />
      <FormField
        label="Telefono"
        id="phone"
        placeholder="+1234567890"
        error={errors.phone?.message as string}
        {...register('phone')}
      />

      {isAdmin && (
        <SelectField
          label="Rol"
          id="role"
          error={errors.role?.message as string}
          {...register('role')}
        >
          <option value="viewer">Visitante</option>
          <option value="admin">Administrador</option>
        </SelectField>
      )}

      <PasswordField
        label={isEditMode ? "Contraseña (Opcional)" : "Contraseña"}
        id="password"
        placeholder="••••••••"
        error={errors.password?.message as string}
        {...register('password')}
      />
      <PasswordField
        label={isEditMode ? "Confirmar contraseña (Opcional)" : "Confirmar contraseña"}
        id="confirmPassword"
        placeholder="••••••••"
        error={errors.confirmPassword?.message as string}
        {...register('confirmPassword')}
      />
      <div className="pt-2">
        <Button type="submit" isLoading={isLoadingAuth || isSubmitting}>
          {isEditMode ? 'Actualizar usuario' : 'Crear cuenta'}
        </Button>
      </div>
      {serverError && <div className="text-red-500 text-sm text-center mt-2">{serverError}</div>}
    </form>
  );
};
