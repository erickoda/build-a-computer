'use client';

import { logout } from '@/src/actions/auth';
import { useRole } from '@/src/hooks/use-role';
import { Button, cn } from '@heroui/react';
import { useRouter } from 'next/navigation';

type AuthButtonProps = {
  /** Where to send a logged-out user. Defaults to /sign-in. */
  signInHref?: string;
  className?: string;
};

const DEFAULT_CLASSNAME =
  // 'border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white';
  'flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm font-medium text-white backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-black/50 active:scale-95';

export default function AuthButton({
  signInHref = '/sign-in',
  className = DEFAULT_CLASSNAME,
  ...props
}: AuthButtonProps) {
  const router = useRouter();
  const role = useRole();
  const isLoggedIn = !!role;

  async function handlePress() {
    if (isLoggedIn) {
      await logout();
    } else {
      router.push(signInHref);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className={cn(DEFAULT_CLASSNAME, className)}
      onPress={handlePress}
      {...props}
    >
      {isLoggedIn ? 'Logout' : 'Login'}
    </Button>
  );
}
