export type UserRole = "admin" | "operateur" | "client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}
