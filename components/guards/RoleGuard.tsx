"use client"

import React, { createContext, useContext, ReactNode } from 'react';
import { UserPermissions, UserRole, getRolePermissions } from '@/lib/permissions';

interface RoleContextType {
  role: UserRole | null;
  permissions: UserPermissions | null;
  isLoading: boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  can: (permission: keyof UserPermissions) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
  role: UserRole | null;
  isLoading?: boolean;
}

export function RoleProvider({ children, role, isLoading = false }: RoleProviderProps) {
  const permissions = role ? getRolePermissions(role) : null;

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return permissions ? permissions[permission] : false;
  };

  const can = hasPermission; // Alias for convenience

  const value: RoleContextType = {
    role,
    permissions,
    isLoading,
    hasPermission,
    can,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

// Permission-based component wrapper
interface PermissionGateProps {
  permission: keyof UserPermissions;
  children: ReactNode;
  fallback?: ReactNode;
  role?: UserRole; // Optional override
}

export function PermissionGate({ permission, children, fallback = null, role }: PermissionGateProps) {
  const { hasPermission, permissions } = useRole();
  
  // If role is provided, use it instead of context
  const checkPermissions = role ? getRolePermissions(role) : permissions;
  const hasAccess = checkPermissions ? checkPermissions[permission] : false;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Role-based component wrapper
interface RoleGateProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { role } = useRole();
  
  const hasAccess = role ? roles.includes(role) : false;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Higher-order component for permission-based rendering
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: keyof UserPermissions,
  fallback?: ReactNode
) {
  return function WithPermissionComponent(props: P) {
    return (
      <PermissionGate permission={permission} fallback={fallback}>
        <WrappedComponent {...props} />
      </PermissionGate>
    );
  };
}

// Higher-order component for role-based rendering
export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  roles: UserRole[],
  fallback?: ReactNode
) {
  return function WithRoleComponent(props: P) {
    return (
      <RoleGate roles={roles} fallback={fallback}>
        <WrappedComponent {...props} />
      </RoleGate>
    );
  };
}

// Common permission gates for convenience
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGate roles={['admin']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export function ManagerOrAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGate roles={['manager', 'admin']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export function CanManageMembers({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="canManageMembers" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function CanCreateProjects({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="canCreateProjects" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function CanEditBudget({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="canEditBudget" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function CanViewAnalytics({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="canViewAnalytics" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function CanManageSprints({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="canManageSprints" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}
