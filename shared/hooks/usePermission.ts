
import { useCallback } from 'react';
import { User } from '../types';
import { rbacService } from '../rbac/rbacService';
import { Permission } from '../rbac/permissions';

export const usePermission = (user: User | null) => {
  const can = useCallback((permission: Permission) => {
    return rbacService.hasPermission(user, permission);
  }, [user]);

  return { can };
};
