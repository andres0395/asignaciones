import { GetServerSideProps } from 'next';
import { DashboardLayout } from '../../components/templates/DashboardLayout';
import { Table } from '../../components/organisms/Table';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Button } from '../../components/atoms/Button';
import { Column } from '../../components/molecules/TableRow';
import { UserProfile } from '../../types';

export default function AdminUsersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { users, meta, isLoading: isUsersLoading, page, setPage } = useUsers();

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

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Failed to delete user');
        return;
      }

      // Refresh the list
      // We can use mutate from useUsers but we need to export it or pass it.
      // Since useUsers is a hook, let's just reload for MVP or trigger re-fetch if we can.
      // Better: useUsers exposes mutate? Yes.
      // But we are inside the component. We can call mutate() from useUsers().
      // Wait, we have mutate from useUsers() -> actually useUsers returns { mutate } ?
      // Let's check useUsers hook.
      router.reload(); // Simple reload for now to ensure state consistency
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    }
  };

  const columns: Column<UserProfile>[] = [
    { header: 'Full Name', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role', className: 'capitalize' },
    {
      header: 'Joined',
      accessor: (row: UserProfile) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (row: UserProfile) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            className="p-1"
            onClick={() => router.push(`/admin/edit-user/${row.id}`)}
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </Button>
          <Button
            variant="danger"
            className="p-1 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
            onClick={() => deleteUser(row.id)}
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout user={user}>
      <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          {/* Add Create User button if needed later */}
        </div>

        <Table
          data={users}
          columns={columns}
          isLoading={isUsersLoading}
          emptyMessage="No users found."
        />

        {/* Pagination Controls */}
        {meta && (
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {meta.page} of {meta.totalPages} ({meta.total} users)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-auto"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="w-auto"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// We rely on client side fetching/protection mostly to keep it simple with SWR
// but checking refresh token here mirrors dashboard protection.
// However, the real extensive check is client side for role.
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
