
import { User } from "../types";
import { PERMISSIONS, Permission } from "./permissions";

// In a real app, these mappings would come from a database.
// For MVP, we define the "Role Policies" here.
const ROLE_DEFINITIONS: Record<string, Permission[]> = {
  'Project Manager': [
    PERMISSIONS.PROJECT_VIEW, PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_EDIT, PERMISSIONS.PROJECT_ARCHIVE, PERMISSIONS.PROJECT_VIEW_BUDGET,
    PERMISSIONS.WORKITEM_VIEW, PERMISSIONS.WORKITEM_CREATE, PERMISSIONS.WORKITEM_EDIT, PERMISSIONS.WORKITEM_DELETE, PERMISSIONS.WORKITEM_APPROVE,
    PERMISSIONS.ASSET_VIEW, PERMISSIONS.ASSET_CREATE, PERMISSIONS.ASSET_EDIT, PERMISSIONS.ASSET_TRANSFER,
    PERMISSIONS.DOC_VIEW, PERMISSIONS.DOC_UPLOAD, PERMISSIONS.DOC_DELETE,
    PERMISSIONS.SYSTEM_SETTINGS_MANAGE, PERMISSIONS.USER_VIEW, PERMISSIONS.USER_MANAGE
  ],
  'Site Supervisor': [
    PERMISSIONS.PROJECT_VIEW, 
    PERMISSIONS.WORKITEM_VIEW, PERMISSIONS.WORKITEM_CREATE, PERMISSIONS.WORKITEM_EDIT,
    PERMISSIONS.ASSET_VIEW,
    PERMISSIONS.DOC_VIEW, PERMISSIONS.DOC_UPLOAD
    // No budget view, no project creation, no asset transfer
  ],
  'Procurement Officer': [
    PERMISSIONS.PROJECT_VIEW, PERMISSIONS.PROJECT_VIEW_BUDGET,
    PERMISSIONS.WORKITEM_VIEW,
    PERMISSIONS.ASSET_VIEW, PERMISSIONS.ASSET_CREATE, PERMISSIONS.ASSET_EDIT,
    PERMISSIONS.DOC_VIEW, PERMISSIONS.DOC_UPLOAD
  ]
};

export const rbacService = {
  /**
   * Returns the list of permissions for a given role name.
   */
  getPermissionsForRole: (roleName: string): Permission[] => {
    return ROLE_DEFINITIONS[roleName] || [];
  },

  /**
   * Checks if a user has a specific permission.
   */
  hasPermission: (user: User | null, permission: Permission): boolean => {
    if (!user) return false;
    // Super admin fallback logic could go here
    const userPermissions = ROLE_DEFINITIONS[user.role] || [];
    return userPermissions.includes(permission);
  },

  /**
   * Checks if a user has ANY of the required permissions.
   */
  hasAnyPermission: (user: User | null, permissions: Permission[]): boolean => {
    if (!user) return false;
    const userPermissions = ROLE_DEFINITIONS[user.role] || [];
    return permissions.some(p => userPermissions.includes(p));
  }
};
