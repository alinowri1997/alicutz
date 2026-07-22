export type UserRole = "admin";

export interface RoleDefinition {
  role: UserRole;
  permissions: readonly string[];
}

export interface AdminSessionPayload {
  uid: string;
  email?: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  role: UserRole;
}
