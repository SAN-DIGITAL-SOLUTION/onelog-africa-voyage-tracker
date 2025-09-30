export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DRIVER = 'driver',
  CUSTOMER = 'customer',
  GUEST = 'guest',
}

export enum Permission {
  // Permissions de base
  VIEW_DASHBOARD = 'view_dashboard',
  
  // Permissions utilisateurs
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  
  // Permissions de mission
  VIEW_MISSIONS = 'view_missions',
  CREATE_MISSIONS = 'create_missions',
  EDIT_MISSIONS = 'edit_missions',
  DELETE_MISSIONS = 'delete_missions',
  
  // Permissions de véhicule
  VIEW_VEHICLES = 'view_vehicles',
  CREATE_VEHICLES = 'create_vehicles',
  EDIT_VEHICLES = 'edit_vehicles',
  DELETE_VEHICLES = 'delete_vehicles',
  
  // Permissions de rapport
  VIEW_REPORTS = 'view_reports',
  GENERATE_REPORTS = 'generate_reports',
  
  // Permissions de paramètres
  MANAGE_SETTINGS = 'manage_settings',
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthUser extends Omit<Profile, 'id'> {
  id: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    provider?: string;
    roles?: string[];
  };
}
