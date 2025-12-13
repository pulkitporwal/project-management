import { getServerSession } from 'next-auth';
import { User } from '@/models/User';
import { Organization } from '@/models/Organization';
import connectDB from '@/lib/db';

export type UserRole = 'admin' | 'manager' | 'employee';

export interface UserPermissions {
  // Organization permissions
  canViewOrganization: boolean;
  canEditOrganization: boolean;
  canDeleteOrganization: boolean;
  canInviteMembers: boolean;
  canManageMembers: boolean;
  
  // Project permissions
  canViewProjects: boolean;
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canAssignTasks: boolean;
  canViewAllProjects: boolean;
  
  // Team permissions
  canViewTeams: boolean;
  canCreateTeams: boolean;
  canEditTeams: boolean;
  canDeleteTeams: boolean;
  canManageTeamMembers: boolean;
  
  // Budget permissions
  canViewBudget: boolean;
  canCreateBudget: boolean;
  canEditBudget: boolean;
  canDeleteBudget: boolean;
  canApproveTransactions: boolean;
  
  // Analytics permissions
  canViewAnalytics: boolean;
  canViewAdvancedAnalytics: boolean;
  canExportData: boolean;
  
  // Sprint permissions
  canCreateSprints: boolean;
  canManageSprints: boolean;
  canViewSprintReports: boolean;
}

export function getRolePermissions(role: UserRole): UserPermissions {
  const basePermissions = {
    canViewOrganization: true,
    canViewProjects: true,
    canViewTeams: true,
    canViewBudget: role !== 'employee',
    canViewAnalytics: true,
    canCreateSprints: true,
    canManageSprints: role !== 'employee',
    canViewSprintReports: true,
  };

  switch (role) {
    case 'admin':
      return {
        ...basePermissions,
        canEditOrganization: true,
        canDeleteOrganization: true,
        canInviteMembers: true,
        canManageMembers: true,
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: true,
        canAssignTasks: true,
        canViewAllProjects: true,
        canCreateTeams: true,
        canEditTeams: true,
        canDeleteTeams: true,
        canManageTeamMembers: true,
        canCreateBudget: true,
        canEditBudget: true,
        canDeleteBudget: true,
        canApproveTransactions: true,
        canViewAdvancedAnalytics: true,
        canExportData: true,
      };

    case 'manager':
      return {
        ...basePermissions,
        canEditOrganization: false,
        canDeleteOrganization: false,
        canInviteMembers: true,
        canManageMembers: true,
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: false,
        canAssignTasks: true,
        canViewAllProjects: true,
        canCreateTeams: true,
        canEditTeams: true,
        canDeleteTeams: false,
        canManageTeamMembers: true,
        canCreateBudget: true,
        canEditBudget: true,
        canDeleteBudget: false,
        canApproveTransactions: true,
        canViewAdvancedAnalytics: true,
        canExportData: true,
      };

    case 'employee':
      return {
        ...basePermissions,
        canEditOrganization: false,
        canDeleteOrganization: false,
        canInviteMembers: false,
        canManageMembers: false,
        canCreateProjects: false,
        canEditProjects: false,
        canDeleteProjects: false,
        canAssignTasks: false,
        canViewAllProjects: false,
        canCreateTeams: false,
        canEditTeams: false,
        canDeleteTeams: false,
        canManageTeamMembers: false,
        canCreateBudget: false,
        canEditBudget: false,
        canDeleteBudget: false,
        canApproveTransactions: false,
        canViewAdvancedAnalytics: false,
        canExportData: false,
      };

    default:
      return basePermissions;
  }
}

export async function getUserRoleInOrganization(
  userId: string,
  organizationId: string
): Promise<UserRole | null> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) return null;

    const association = user.associatedWith?.find(
      (assoc: any) => 
        assoc.organisationId.toString() === organizationId && 
        assoc.isActive && 
        !assoc.banned
    );

    return association ? association.role : null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function getUserPermissions(
  userId: string,
  organizationId: string
): Promise<UserPermissions | null> {
  try {
    const role = await getUserRoleInOrganization(userId, organizationId);
    if (!role) return null;

    return getRolePermissions(role);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return null;
  }
}

export async function hasPermission(
  userId: string,
  organizationId: string,
  permission: keyof UserPermissions
): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId, organizationId);
    return permissions ? permissions[permission] : false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

// Client-side utility functions
export function usePermissions(permissions: UserPermissions) {
  const can = (permission: keyof UserPermissions) => permissions[permission];
  
  return {
    can,
    canViewOrganization: () => permissions.canViewOrganization,
    canEditOrganization: () => permissions.canEditOrganization,
    canDeleteOrganization: () => permissions.canDeleteOrganization,
    canInviteMembers: () => permissions.canInviteMembers,
    canManageMembers: () => permissions.canManageMembers,
    canViewProjects: () => permissions.canViewProjects,
    canCreateProjects: () => permissions.canCreateProjects,
    canEditProjects: () => permissions.canEditProjects,
    canDeleteProjects: () => permissions.canDeleteProjects,
    canAssignTasks: () => permissions.canAssignTasks,
    canViewAllProjects: () => permissions.canViewAllProjects,
    canViewTeams: () => permissions.canViewTeams,
    canCreateTeams: () => permissions.canCreateTeams,
    canEditTeams: () => permissions.canEditTeams,
    canDeleteTeams: () => permissions.canDeleteTeams,
    canManageTeamMembers: () => permissions.canManageTeamMembers,
    canViewBudget: () => permissions.canViewBudget,
    canCreateBudget: () => permissions.canCreateBudget,
    canEditBudget: () => permissions.canEditBudget,
    canDeleteBudget: () => permissions.canDeleteBudget,
    canApproveTransactions: () => permissions.canApproveTransactions,
    canViewAnalytics: () => permissions.canViewAnalytics,
    canViewAdvancedAnalytics: () => permissions.canViewAdvancedAnalytics,
    canExportData: () => permissions.canExportData,
    canCreateSprints: () => permissions.canCreateSprints,
    canManageSprints: () => permissions.canManageSprints,
    canViewSprintReports: () => permissions.canViewSprintReports,
  };
}

// Server-side permission guard
export async function requirePermission(
  permission: keyof UserPermissions,
  organizationId: string
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }

  const hasPerm = await hasPermission(session.user.id, organizationId, permission);
  if (!hasPerm) {
    throw new Error(`Permission denied: ${permission}`);
  }

  return session;
}

// React hook for client-side permission checking
export function createPermissionHook(permissions: UserPermissions) {
  return function usePermission(permission: keyof UserPermissions) {
    return permissions[permission];
  };
}
