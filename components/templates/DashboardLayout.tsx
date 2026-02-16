import { ReactNode } from 'react';
import { useRefreshToken } from '../../hooks/useRefreshToken';
import { UserProfile } from '../../types';
import { Sidebar } from '../organisms/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../atoms/Button';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: UserProfile;
}

export const DashboardLayout = ({ children, user }: DashboardLayoutProps) => {
  const { logout } = useAuth();
  useRefreshToken();

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-neutral-900">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 p-4 justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My App</h1>
          <Button variant="secondary" onClick={logout} className="text-xs">Logout</Button>
        </div>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
