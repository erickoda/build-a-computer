import { Role } from './jwt';

export type RouteItems = {
  label: string;
  href: string;
  allowedRoles: Role[];
  isPublic: boolean;
  isInNavbar: boolean;
};

export const routesInfos: RouteItems[] = [
  {
    label: 'Sign In',
    href: '/sign-in',
    allowedRoles: [],
    isPublic: true,
    isInNavbar: false,
  },
  {
    label: 'Sign Up',
    href: '/sign-up',
    allowedRoles: [],
    isPublic: true,
    isInNavbar: false,
  },
  {
    label: 'Forgot Password',
    href: '/forgot-password',
    allowedRoles: [],
    isPublic: true,
    isInNavbar: false,
  },
  {
    label: 'Home',
    href: '/',
    allowedRoles: ['admin', 'supervisor', 'common'],
    isPublic: true,
    isInNavbar: true,
  },
  {
    label: 'Users',
    href: '/users',
    allowedRoles: ['admin', 'supervisor'],
    isPublic: false,
    isInNavbar: true,
  },
  {
    label: 'Benchmarks',
    href: '/benchmarks',
    allowedRoles: ['admin', 'supervisor', 'common'],
    isPublic: true,
    isInNavbar: true,
  },
  {
    label: 'Create Benchmarks',
    href: '/benchmarks/create',
    allowedRoles: ['admin', 'supervisor'],
    isPublic: false,
    isInNavbar: true,
  },
  {
    label: 'Hardware',
    href: '/hardware',
    allowedRoles: ['admin', 'supervisor', 'common'],
    isPublic: false,
    isInNavbar: true,
  },
  {
    label: 'Games',
    href: '/games',
    allowedRoles: ['admin', 'supervisor', 'common'],
    isPublic: false,
    isInNavbar: true,
  },
];

export function matchesRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
