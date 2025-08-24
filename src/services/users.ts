import { supabase } from "../integrations/supabase/client";

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

export async function createUserProfile(userId: string, values: { name: string; email: string; role: string }) {
  // Insert into users table, update metadata if needed
  const { error } = await supabase.from("users").insert([
    { id: userId, ...values },
  ]);
  if (error) throw error;
  // Optionally update Supabase Auth metadata
  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { name: values.name, role: values.role },
  });
}

export async function updateUserProfile(userId: string, values: { name: string; role: string }) {
  const { error } = await supabase
    .from("users")
    .update({ name: values.name, role: values.role })
    .eq("id", userId);
  if (error) throw error;
  // Optionally update Supabase Auth metadata
  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { name: values.name, role: values.role },
  });
}
