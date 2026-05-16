import { useMemo } from 'react';

import {
  canAccessAnalytics,
  canManageUsers,
  canReview,
  getStoredUser,
  ROLES
} from '../utils/api/auth';

/**
 * Centralized auth hook. Returns the current user and all derived role flags.
 * Use this instead of calling getStoredUser() directly in pages/components.
 */
export function useAuth() {
  const user = useMemo(() => getStoredUser(), []);

  const role = user?.role ?? ROLES.EMPLOYEE;
  const isEmployee = role === ROLES.EMPLOYEE;
  const isApprover = role === ROLES.APPROVER;
  const isAdmin = role === ROLES.ADMIN;
  const canReviewRequests = canReview(user);   // only approver
  const canViewAnalytics = canAccessAnalytics(user); // approver + admin
  const canManage = canManageUsers(user);       // only admin

  return {
    user,
    role,
    isEmployee,
    isApprover,
    isAdmin,
    canReviewRequests,
    canViewAnalytics,
    canManage
  };
}
