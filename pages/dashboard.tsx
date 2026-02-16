import { GetServerSideProps } from 'next';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { prisma } from '../lib/prisma';
import { verifyRefreshToken } from '../lib/auth';

import { UserProfile } from '../types';

interface DashboardProps {
  userInitial?: UserProfile;
}

export default function DashboardPage({ userInitial }: DashboardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && !userInitial) {
      router.push('/login');
    }
  }, [user, isLoading, router, userInitial]);

  if (isLoading && !userInitial) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout user={user || userInitial}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Profile</h2>

        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Information</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Personal details and application role.</p>
          </div>

          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{(user || userInitial)?.fullName}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{(user || userInitial)?.email}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{(user || userInitial)?.role}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date((user || userInitial)?.createdAt || '').toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Verify refresh token on server side for initial render
  try {
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId) {
      throw new Error('Invalid token');
    }

    // Optionally fetch user data here to pre-fill
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, fullName: true, email: true, role: true, refreshToken: true },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid token');
    }

    return {
      props: {
        userInitial: user,
      },
    };
  } catch {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};
