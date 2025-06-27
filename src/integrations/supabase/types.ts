// Types de base pour les rôles utilisateurs
/**
 * Rôles principaux du système OneLog Africa
 * @see ROLES_SYSTEME_ONELOG.md pour la documentation complète des rôles
 */
export type UserRole = 
  | 'client'           // Création de demandes, suivi, facturation
  | 'chauffeur'        // Exécution des missions, mises à jour GPS
  | 'admin'            // Administration complète du système
  | 'gestionnaire_client'  // Gestion des comptes clients
  | 'responsable_securite' // Surveillance et sécurité
  | 'comptable';           // Facturation et comptabilité

/**
 * Interface pour le profil utilisateur dans la table 'profiles'
 */
export interface UserProfile {
  id: string;            // ID unique de l'utilisateur (lié à auth.users)
  role: UserRole;        // Rôle principal de l'utilisateur
  email?: string;         // Email de l'utilisateur
  full_name?: string;     // Nom complet de l'utilisateur
  phone?: string;         // Numéro de téléphone (optionnel)
  company?: string;      // Entreprise (pour les clients)
  created_at: string;    // Date de création
  updated_at: string;     // Date de dernière mise à jour
  last_login?: string;    // Dernière connexion
  is_active: boolean;     // Si le compte est actif
  metadata?: Record<string, any>; // Métadonnées supplémentaires
}

/**
 * Permissions disponibles dans le système
 */
export enum Permission {
  // Permissions générales
  VIEW_DASHBOARD = 'view_dashboard',
  
  // Permissions clients
  CREATE_DEMANDE = 'create_demande',
  VIEW_OWN_DEMANDES = 'view_own_demandes',
  TRACK_MISSIONS = 'track_missions',
  VIEW_OWN_FACTURES = 'view_own_factures',
  PAY_ONLINE = 'pay_online',
  RATE_DRIVER = 'rate_driver',
  
  // Permissions chauffeurs
  VIEW_ASSIGNED_MISSIONS = 'view_assigned_missions',
  UPDATE_GPS_LOCATION = 'update_gps_location',
  REPORT_INCIDENT = 'report_incident',
  CONFIRM_DELIVERY = 'confirm_delivery',
  
  // Permissions admin/exploitant
  MANAGE_MISSIONS = 'manage_missions',
  MANAGE_FLEET = 'manage_fleet',
  MANAGE_DRIVERS = 'manage_drivers',
  MANAGE_CLIENTS = 'manage_clients',
  VIEW_ALL_DEMANDES = 'view_all_demandes',
  VIEW_ALL_FACTURES = 'view_all_factures',
  
  // Permissions responsable sécurité
  MANAGE_SECURITY = 'manage_security',
  VIEW_SECURITY_ALERTS = 'view_security_alerts',
  MANAGE_RISK_ZONES = 'manage_risk_zones',
  
  // Permissions comptable
  MANAGE_INVOICES = 'manage_invoices',
  PROCESS_PAYMENTS = 'process_payments',
  GENERATE_REPORTS = 'generate_reports',
}

/**
 * Mappage des rôles vers les permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  client: [
    Permission.VIEW_DASHBOARD,
    Permission.CREATE_DEMANDE,
    Permission.VIEW_OWN_DEMANDES,
    Permission.TRACK_MISSIONS,
    Permission.VIEW_OWN_FACTURES,
    Permission.PAY_ONLINE,
    Permission.RATE_DRIVER,
  ],
  chauffeur: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ASSIGNED_MISSIONS,
    Permission.UPDATE_GPS_LOCATION,
    Permission.REPORT_INCIDENT,
    Permission.CONFIRM_DELIVERY,
  ],
  admin: Object.values(Permission), // Toutes les permissions
  gestionnaire_client: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_CLIENTS,
    Permission.VIEW_ALL_DEMANDES,
    Permission.VIEW_ALL_FACTURES,
  ],
  responsable_securite: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_SECURITY,
    Permission.VIEW_SECURITY_ALERTS,
    Permission.MANAGE_RISK_ZONES,
  ],
  comptable: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_INVOICES,
    Permission.PROCESS_PAYMENTS,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_ALL_FACTURES,
  ],
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      email_logs: {
        Row: {
          body: string | null
          created_at: string | null
          email_to: string
          error_message: string | null
          id: string
          mission_id: string
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          email_to: string
          error_message?: string | null
          id?: string
          mission_id: string
          status: string
          subject: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          email_to?: string
          error_message?: string | null
          id?: string
          mission_id?: string
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          mission_ref: string | null
          number: string
          pdf_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          mission_ref?: string | null
          number: string
          pdf_url?: string | null
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          mission_ref?: string | null
          number?: string
          pdf_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      mission_feedback: {
        Row: {
          client_email: string | null
          client_name: string | null
          comment: string | null
          created_at: string | null
          id: string
          mission_id: string
          rating: number
          updated_at: string | null
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          mission_id: string
          rating: number
          updated_at?: string | null
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          mission_id?: string
          rating?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_feedback_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_status_history: {
        Row: {
          changed_at: string
          id: string
          mission_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          changed_at?: string
          id?: string
          mission_id: string
          status: string
          user_id?: string | null
        }
        Update: {
          changed_at?: string
          id?: string
          mission_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_status_history_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          chauffeur: string | null
          client: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          lieu_enlevement: string | null
          lieu_livraison: string | null
          poids: number | null
          ref: string
          status: string
          type_de_marchandise: string | null
          updated_at: string | null
          user_id: string
          volume: number | null
        }
        Insert: {
          chauffeur?: string | null
          client: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          lieu_enlevement?: string | null
          lieu_livraison?: string | null
          poids?: number | null
          ref: string
          status: string
          type_de_marchandise?: string | null
          updated_at?: string | null
          user_id: string
          volume?: number | null
        }
        Update: {
          chauffeur?: string | null
          client?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          lieu_enlevement?: string | null
          lieu_livraison?: string | null
          poids?: number | null
          ref?: string
          status?: string
          type_de_marchandise?: string | null
          updated_at?: string | null
          user_id?: string
          volume?: number | null
        }
        Relationships: []
      }
      missions_documents: {
        Row: {
          filename: string
          id: string
          mission_id: string
          uploaded_at: string
          url: string
          user_id: string
        }
        Insert: {
          filename: string
          id?: string
          mission_id: string
          uploaded_at?: string
          url: string
          user_id: string
        }
        Update: {
          filename?: string
          id?: string
          mission_id?: string
          uploaded_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_documents_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          message: string
          mission_id: string | null
          sent_at: string | null
          target: string
          trigger: string | null
          type: string
          user_id: string
        }
        Insert: {
          id?: string
          message: string
          mission_id?: string | null
          sent_at?: string | null
          target: string
          trigger?: string | null
          type: string
          user_id: string
        }
        Update: {
          id?: string
          message?: string
          mission_id?: string | null
          sent_at?: string | null
          target?: string
          trigger?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tracking_points: {
        Row: {
          created_at: string
          id: string
          latitude: number
          longitude: number
          mission_id: string
          recorded_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          mission_id: string
          recorded_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          mission_id?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_points_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "exploiteur" | "chauffeur"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client", "chauffeur", "gestionnaire_client", "responsable_securite", "comptable"],
    },
  },
} as const
