import { GetServerSideProps } from 'next';
import { LoginForm } from '../components/organisms/LoginForm';
import { AuthLayout } from '../components/templates/AuthLayout';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <AuthLayout title="Sign in to your account">
      <LoginForm />
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-black dark:text-white hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

// Redirect if already logged in? 
// Middleware might handle it, or we can check here.
// But we can't easily check access token in SSR unless it's in cookie.
// We only put refresh token in cookie.
// So we rely on client side redirect in useAuth or just let them see login page.
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
