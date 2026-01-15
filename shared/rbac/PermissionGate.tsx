
import React from 'react';
import { Permission } from './permissions';
import { rbacService } from './rbacService';
import { User } from '../types';

interface PermissionGateProps {
  user: User | null;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A wrapper component that only renders its children if the user has the required permission.
 * Usage: <PermissionGate user={currentUser} permission={PERMISSIONS.PROJECT_CREATE}><Button>...</Button></PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({ 
  user, 
  permission, 
  children, 
  fallback = null 
}) => {
  const hasAccess = rbacService.hasPermission(user, permission);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
