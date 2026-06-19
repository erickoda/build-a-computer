import { Role } from './jwt';

export type RouteItems = {
  label: string;
  href: string;
  allowedRoles: Role[];
};

export const routesInfos: RouteItems[] = [
  { label: 'Users', href: '/users', allowedRoles: ['admin', 'supervisor'] },
  {
    label: 'Benchmarks',
    href: '/benchmarks',
    allowedRoles: ['admin', 'supervisor', 'common'],
  },
  {
    label: 'Create Benchmarks',
    href: '/benchmarks/create',
    allowedRoles: ['admin', 'supervisor'],
  },
];
