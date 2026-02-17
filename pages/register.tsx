import { UserForm } from '../components/organisms/UserForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Crear cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            iniciar sesión en tu cuenta existente
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <UserForm />
        </div>
      </div>
    </div>
  );
}
