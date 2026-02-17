import { useRouter } from 'next/router';
import { DashboardLayout } from '../../../components/templates/DashboardLayout';
import { UserForm } from '../../../components/organisms/UserForm';
import { useAuth } from '../../../hooks/useAuth';
import useSWR from 'swr';
import { UserProfile } from '../../../types';
import { useEffect } from 'react';

const fetcher = async (url: string) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};

export default function AdminEditUserPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: isAuthLoading } = useAuth();

  const { data: userData, error: userError, isLoading: isUserLoading } = useSWR<UserProfile>(
    id ? `/api/users/${id}` : null,
    fetcher
  );

  useEffect(() => {
    if (!isAuthLoading && user && user.role !== 'admin') {
      router.push('/dashboard');
    } else if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || (user && user.role !== 'admin')) return <div>Verificando acceso...</div>;
  if (isUserLoading) return <div>Cargando datos del usuario...</div>;
  if (userError) return <div>Error cargando usuario</div>;

  return (
    <DashboardLayout user={user}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Editar usuario</h2>
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 grid place-items-center">
          {userData && (
            <UserForm
              initialData={userData}
              isEditMode={true}
              onSuccess={() => router.push('/admin/users')}
              isAdmin={true}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
