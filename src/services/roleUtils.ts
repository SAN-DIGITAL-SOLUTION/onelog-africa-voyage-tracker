// Fonctions utilitaires pour la gestion des rôles et droits d'accès (OneLog Africa)

export function canAccessDashboard(user: any): boolean {
  // Autorise si le rôle est défini et approuvé
  return !!user && !!user.role && user.role_status === 'approved';
}

export function canAccessAdmin(user: any): boolean {
  return !!user && user.role === 'admin' && user.role_status === 'approved';
}

export function canModerateRoles(user: any): boolean {
  // Seuls les admins approuvés peuvent modérer
  return canAccessAdmin(user);
}

export function getUserRoleStatus(user: any): string {
  if (!user || !user.role) return 'none';
  if (user.role_status === 'pending') return 'pending';
  if (user.role_status === 'approved') return 'approved';
  return 'unknown';
}
