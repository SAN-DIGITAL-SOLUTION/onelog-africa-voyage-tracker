export type RoleAssignmentMode = 'admin_only' | 'hybrid' | 'self_service';

export const ROLE_ASSIGNMENT_MODE: RoleAssignmentMode =
  (import.meta.env.VITE_ROLE_ASSIGNMENT_MODE as RoleAssignmentMode) || 'hybrid';
