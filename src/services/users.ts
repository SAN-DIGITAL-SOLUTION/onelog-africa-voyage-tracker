import { supabase } from '@/integrations/supabase/client';
import { auditService } from '@/services/auditService';

export async function getUserProfile(userId: string) {
  // Fetch from extended users table
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, created_at")
    .eq("id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createUserProfile(userId: string, values: { name: string; email: string; role: string }, actorId?: string) {
  // Insert into users table, update metadata if needed
  const { error } = await supabase.from("users").insert([
    { id: userId, ...values },
  ]);
  if (error) throw error;
  
  // Optionally update Supabase Auth metadata
  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { name: values.name, role: values.role },
  });
  
  // Audit trail: Log user profile creation
  if (actorId) {
    await auditService.logCreate(
      actorId,
      'user',
      userId,
      { 
        name: values.name,
        email: values.email,
        role: values.role
      }
    );
  }
}

export async function updateUserProfile(userId: string, values: { name: string; role: string }, actorId?: string) {
  // Fetch before state for audit
  const { data: beforeUpdate } = await supabase
    .from("users")
    .select("name, role")
    .eq("id", userId)
    .single();
  
  const { error } = await supabase
    .from("users")
    .update({ name: values.name, role: values.role })
    .eq("id", userId);
  if (error) throw error;
  
  // Optionally update Supabase Auth metadata
  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { name: values.name, role: values.role },
  });
  
  // Audit trail: Log user profile update (especially role changes)
  if (actorId) {
    const roleChanged = beforeUpdate?.role !== values.role;
    await auditService.logUpdate(
      actorId,
      'user',
      userId,
      { 
        before: beforeUpdate,
        after: values,
        role_changed: roleChanged,
        ...(roleChanged && { 
          previous_role: beforeUpdate?.role,
          new_role: values.role 
        })
      }
    );
  }
}
