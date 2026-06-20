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
        className={[
          'fixed top-3 left-3 z-50 flex items-center justify-center gap-2 px-2 py-2 rounded-lg border ',
          'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'hover:border-white/25 hover:bg-black/40',
          'border-white/8 bg-black',
          'backdrop-blur-[50px]',
          'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(175,175,175,0.35)]',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_16px_rgba(175,175,175,0.25)]',
        ].join(' ')} //"fixed top-3 left-3 z-50 flex items-center justify-center rounded-md border border-border bg-surface/80 p-2 text-foreground backdrop-blur-md hover:bg-accent hover:text-accent-foreground"
      >
        <Bars3Icon className="size-6" />
      </Drawer.Trigger>

      <Drawer.Backdrop>
        <Drawer.Content
          placement="left"
          className={[
            'gap-2 px-5 py-5 rounded-lg w-94',
            'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
          ].join(' ')} //"w-64"
        >
          <Drawer.Dialog
            className={[
              'rounded-lg',
              'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
              'border-white/8 bg-black/20',
              'backdrop-blur-[20px]',
              'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(175,175,175,0.35)]',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_16px_rgba(175,175,175,0.25)]',
            ].join(' ')}
          >
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
                      className={`font-mono text-sm px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-neutral-400/30 text-accent-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_2px_4px_rgba(175,175,175,0.55)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(175,175,175,0.35)] font-medium'
                          : 'text-foreground border-white/8 hover:bg-neutral-400/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(175,175,175,0.25)] hover:text-accent-foreground'
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
                  className={[
                    'fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 px-5 py-3 rounded-lg',
                    'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    'hover:border-white/25 hover:bg-black/40',
                    'border-white/8 bg-black',
                    'backdrop-blur-[50px]',
                    'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(212,175,110,0.35)]',
                    'shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_16px_rgba(212,175,110,0.25)]',
                  ].join(' ')}
                  size="sm"
                  variant="outline"
                  onPress={async () => await logout()}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  className={[
                    'fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 px-5 py-3 rounded-lg',
                    'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    'hover:border-white/25 hover:bg-black/40',
                    'border-white/8 bg-black',
                    'backdrop-blur-[50px]',
                    'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(175,175,175,0.35)]',
                    'shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_16px_rgba(175,175,175,0.25)]',
                  ].join(' ')}
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
