"use client";

import Link from 'next/link';
import { useTheme } from "next-themes";
import { Button, Switch } from '@heroui/react';
import { usePathname } from 'next/navigation';
import { logout } from '@/src/actions/auth';
import { useRole } from '@/src/hooks/use-role';
import { routesInfos } from '../types/routes';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const role = useRole();

  const visibleItems = routesInfos.filter(
    item => role && item.allowedRoles.includes(role)
  );

  return (
    <nav className="flex items-center px-6 h-14 border-b border-blue-300 w-full bg-blue-200">
      <div className="flex-1">
        <span className="font-bold font-mono text-sm text-slate-900">
          BUILD A PC GAMER
        </span>
      </div>
      <div className="flex items-center gap-1">
        {visibleItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`font-mono text-sm px-3 py-1.5 rounded-md transition-colors ${pathname.startsWith(item.href)
              ? 'bg-blue-900 text-white font-medium'
              : 'text-slate-900 hover:text-white hover:bg-blue-900'
              }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex-1 flex justify-end flex-row space-x-2">
        <Switch defaultSelected size="lg" onChange={() => { setTheme(theme === "dark" ? "light" : "dark") }}>
          <>
            <Switch.Control className={theme === "light" ? "bg-white" : ""}>
              <Switch.Thumb>
                <Switch.Icon className='p-2'>
                  {theme === "light" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                  )}
                </Switch.Icon>
              </Switch.Thumb>
            </Switch.Control>
          </>
        </Switch>

        <Button
          size="sm"
          variant="outline"
          className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
          onPress={async () => await logout()}
        >
          Logout
        </Button>
      </div>
    </nav >
  );
}
