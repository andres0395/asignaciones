import { RegisterForm } from '../components/organisms/RegisterForm';
import { AuthLayout } from '../components/templates/AuthLayout';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <AuthLayout title="Create a new account">
      <RegisterForm />
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-black dark:text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
