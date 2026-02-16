import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserProfile } from '../../types';
import { Button } from '../atoms/Button';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  user?: UserProfile;
}

export const Sidebar = ({ user }: SidebarProps) => {
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (path: string) => router.pathname === path;

  const links = [
    { href: '/dashboard', label: 'My Account', roles: ['admin', 'viewer'] },
    { href: '/admin/users', label: 'Users', roles: ['admin'] },
    { href: '/admin/create-user', label: 'Create User', roles: ['admin'] },
  ];

  const filteredLinks = links.filter(link =>
    user && link.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My App</h1>
        {user && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
            {user.fullName}
          </p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive(link.href)
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200'
              : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-neutral-700'
              }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
        <Button variant="secondary" onClick={logout} className="w-full justify-center">
          Logout
        </Button>
      </div>
    </aside>
  );
};
