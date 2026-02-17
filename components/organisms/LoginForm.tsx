import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../hooks/useAuth';
import { FormField } from '../molecules/FormField';
import { PasswordField } from '../molecules/PasswordField';
import { Button } from '../atoms/Button';
import * as yup from 'yup';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

type LoginFormData = yup.InferType<typeof schema>;

export const LoginForm = () => {
  const { login, isLoadingAuth, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    schema,
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
      <FormField
        label="Email"
        id="email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message as string}
        {...register('email')}
      />
      <PasswordField
        label="Contraseña"
        id="password"
        placeholder="••••••••"
        error={errors.password?.message as string}
        {...register('password')}
      />
      <div className="pt-2">
        <Button type="submit" isLoading={isLoadingAuth}>
          Iniciar sesión
        </Button>
      </div>
      {error && <div className="text-red-500 text-sm text-center mt-2">{error.message || 'Iniciar sesión fallido'}</div>}
    </form>
  );
};
