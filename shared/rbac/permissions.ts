
/**
 * Unified Permissions Catalog
 * This acts as the single source of truth for all capability checks in the application.
 * Format: resource:action
 */
export const PERMISSIONS = {
  // Projects
  PROJECT_VIEW: 'project:view',
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_ARCHIVE: 'project:archive',
  PROJECT_VIEW_BUDGET: 'project:view_budget',

  // Work Items (Operations)
  WORKITEM_VIEW: 'workitem:view',
  WORKITEM_CREATE: 'workitem:create',
  WORKITEM_EDIT: 'workitem:edit',
  WORKITEM_DELETE: 'workitem:delete',
  WORKITEM_APPROVE: 'workitem:approve',

  // Assets
  ASSET_VIEW: 'asset:view',
  ASSET_CREATE: 'asset:create',
  ASSET_EDIT: 'asset:edit',
  ASSET_TRANSFER: 'asset:transfer', // Custody transfer

  // Documents
  DOC_VIEW: 'doc:view',
  DOC_UPLOAD: 'doc:upload',
  DOC_DELETE: 'doc:delete',

  // System
  SYSTEM_SETTINGS_MANAGE: 'system:manage_settings',
  USER_VIEW: 'user:view',
  USER_MANAGE: 'user:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
