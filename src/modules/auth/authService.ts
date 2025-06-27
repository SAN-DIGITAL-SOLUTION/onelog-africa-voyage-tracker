import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function login(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function logout() {
  return supabase.auth.signOut();
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

export async function getUserRoles(userId: string): Promise<string[]> {
  // Jointure user_roles → roles pour obtenir les noms de rôle
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', userId);
  if (error) return [];
  return (data || []).map((r: any) => r.roles?.name).filter(Boolean);
}

export async function setUserRoles(userId: string, roleNames: string[]) {
  // Récupère tous les rôles existants
  const { data: allRoles } = await supabase.from('roles').select('id, name');
  const roleIds = (allRoles || [])
    .filter((r: any) => roleNames.includes(r.name))
    .map((r: any) => r.id);
  // Supprime tous les rôles existants pour cet utilisateur
  await supabase.from('user_roles').delete().eq('user_id', userId);
  // Ajoute les nouveaux rôles
  if (roleIds.length) {
    await supabase.from('user_roles').insert(roleIds.map((role_id: number) => ({ user_id: userId, role_id })));
  }
}

export async function hasRole(userId: string, role: string) {
  const roles = await getUserRoles(userId);
  return roles.includes(role);
}

export async function getAllRoles(): Promise<{ id: number, name: string, description: string }[]> {
  const { data } = await supabase.from('roles').select('id, name, description');
  return data || [];
}

export async function getAllPermissions(): Promise<{ id: number, name: string, description: string }[]> {
  const { data } = await supabase.from('permissions').select('id, name, description');
  return data || [];
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  // Jointure user_roles → roles → permissions (si mapping existe)
  // Pour l’instant, retourne vide (extension future)
  return [];
}

