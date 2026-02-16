import { GetServerSideProps } from 'next';
import { DashboardLayout } from '../../components/templates/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { UserForm } from '../../components/organisms/UserForm';

export default function AdminCreateUserPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && user && user.role !== 'admin') {
      router.push('/dashboard');
    } else if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || (user && user.role !== 'admin')) {
    return <div className="flex justify-center items-center min-h-screen">Verifying access...</div>;
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New User</h2>
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 grid place-items-center">
          <UserForm
            redirectTo="" // Don't redirect to login
            onSuccess={() => router.push('/admin/users')}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
