import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../hooks/useAuth';
import { FormField } from '../molecules/FormField';
import { PasswordField } from '../molecules/PasswordField';
import { Button } from '../atoms/Button';
import * as yup from 'yup';
import { useState } from 'react';

const schema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

type RegisterFormData = yup.InferType<typeof schema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const RegisterForm = ({ onSuccess, redirectTo = '/login' }: RegisterFormProps) => {
  const { register: registerUser, isLoadingAuth } = useAuth();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    schema,
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError('');
      await registerUser(data, redirectTo);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setServerError((err as { message: string }).message);
      } else {
        setServerError('Registration failed');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
      <FormField
        label="Full Name"
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
        label="Phone"
        id="phone"
        placeholder="+1234567890"
        error={errors.phone?.message as string}
        {...register('phone')}
      />
      <PasswordField
        label="Password"
        id="password"
        placeholder="••••••••"
        error={errors.password?.message as string}
        {...register('password')}
      />
      <PasswordField
        label="Confirm Password"
        id="confirmPassword"
        placeholder="••••••••"
        error={errors.confirmPassword?.message as string}
        {...register('confirmPassword')}
      />
      <div className="pt-2">
        <Button type="submit" isLoading={isLoadingAuth}>
          Create Account
        </Button>
      </div>
      {serverError && <div className="text-red-500 text-sm text-center mt-2">{serverError}</div>}
    </form>
  );
};
