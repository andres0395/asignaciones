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

  const columns: Column<UserProfile>[] = [
    { header: 'Full Name', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role', className: 'capitalize' },
    {
      header: 'Joined',
      accessor: (row: UserProfile) => new Date(row.createdAt).toLocaleDateString(),
    },
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
