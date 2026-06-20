'use client';

import { logout } from '@/src/actions/auth';
import { useRole } from '@/src/hooks/use-role';
import { Button } from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { routesInfos } from '../types/routes';
import ToggleTheme from './toggleTheme';

export default function Navbar() {
  const pathname = usePathname();
  const role = useRole();

  const visibleItems = routesInfos.filter(
    (item) => role && item.allowedRoles.includes(role),
  );

  return (
    <nav className="flex items-center px-6 h-14 border-b border-blue-300 w-full bg-blue-200">
      <div className="flex-1">
        <span className="font-bold font-mono text-sm text-slate-900">
          BUILD A PC GAMER
        </span>
      </div>
      <div className="flex items-center gap-1">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`font-mono text-sm px-3 py-1.5 rounded-md transition-colors ${
              pathname.startsWith(item.href)
                ? 'bg-blue-900 text-white font-medium'
                : 'text-slate-900 hover:text-white hover:bg-blue-900'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex-1 flex justify-end flex-row space-x-2">
        <ToggleTheme />

        <Button
          size="sm"
          variant="outline"
          className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
          onPress={async () => await logout()}
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}
