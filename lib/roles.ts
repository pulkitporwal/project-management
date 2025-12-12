import { Session } from "next-auth";

export type AppRole = 'admin' | 'manager' | 'employee';

export function hasAnyRole(session: Session | null, roles: AppRole[]) {
  const role = session?.user?.role as AppRole | undefined;
  return !!role && roles.includes(role);
}

export function canManageProjects(session: Session | null) {
  return hasAnyRole(session, ['admin', 'manager']);
}

export function canViewAnalytics(session: Session | null) {
  return hasAnyRole(session, ['admin', 'manager', 'employee']);
}

export function canManageTeams(session: Session | null) {
  return hasAnyRole(session, ['admin', 'manager']);
}

