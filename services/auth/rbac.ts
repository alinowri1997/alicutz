import { AUTH_ROLES } from "@/config/firebase";
import type { UserRole } from "@/types/auth";

const ROLE_HIERARCHY: UserRole[] = [AUTH_ROLES.admin];

export function hasRequiredRole(userRole: UserRole | null | undefined, allowedRoles: readonly UserRole[]): boolean {
  if (!userRole) {
    return false;
  }

  const userIndex = ROLE_HIERARCHY.indexOf(userRole);

  return allowedRoles.some((role) => {
    const targetIndex = ROLE_HIERARCHY.indexOf(role);
    return userIndex >= targetIndex;
  });
}

export function isAdminRole(role: UserRole | null | undefined): role is "admin" {
  return role === AUTH_ROLES.admin;
}
