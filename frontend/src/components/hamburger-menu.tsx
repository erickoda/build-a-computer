'use client';

import { logout } from '@/src/actions/auth';
import { useRole } from '@/src/hooks/use-role';
import { matchesRoute, routesInfos } from '@/src/types/routes';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Drawer } from '@heroui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ToggleTheme from './toggleTheme';

export default function HamburgerMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useRole();

  return (
    <Drawer>
      <Drawer.Trigger
        aria-label="Open menu"
        className="fixed top-3 left-3 z-50 flex items-center justify-center rounded-md border border-border bg-surface/80 p-2 text-foreground backdrop-blur-md hover:bg-accent hover:text-accent-foreground"
      >
        <Bars3Icon className="size-6" />
      </Drawer.Trigger>

      <Drawer.Backdrop>
        <Drawer.Content placement="left" className="w-64">
          <Drawer.Dialog>
            <Drawer.Header className="flex flex-row items-center justify-between">
              <Drawer.Heading className="font-mono text-sm font-bold">
                BUILD A PC GAMER
              </Drawer.Heading>
              <Drawer.CloseTrigger aria-label="Close menu">
                <XMarkIcon className="size-5" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body className="flex flex-col gap-1">
              {routesInfos
                .filter((item) => item.isInNavbar)
                .map((item) => {
                  const isAllowed =
                    item.isPublic ||
                    (!!role && item.allowedRoles.includes(role));
                  const isActive = matchesRoute(pathname, item.href);

                  if (!isAllowed) {
                    return (
                      <span
                        key={item.href}
                        aria-disabled="true"
                        className="font-mono text-sm px-3 py-2 rounded-md text-muted/50 cursor-not-allowed select-none"
                      >
                        {item.label}
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      slot="close"
                      className={`font-mono text-sm px-3 py-2 rounded-md transition-colors ${isActive
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
            </Drawer.Body>

            <Drawer.Footer className="flex flex-row items-center justify-between">
              <ToggleTheme />
              {role ? (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={async () => await logout()}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  slot="close"
                  onPress={() => router.push('/sign-in')}
                >
                  Sign In
                </Button>
              )}
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
