import { supabase } from '@/integrations/supabase/client';
import { auditService } from '@/services/auditService';
import { userRepository } from '@/repositories/userRepository';
import type { CreateUserData } from '@/repositories/userRepository';

export async function getUserProfile(userId: string) {
  return await userRepository.findById(userId);
}

export async function createUserProfile(userId: string, values: { name: string; email: string; role: string }, actorId?: string) {
  // Create user in users table
  const userData: CreateUserData = {
    id: userId,
    name: values.name,
    email: values.email,
    role: values.role as any // Type assertion for role
  };
  
  const user = await userRepository.create(userData);
  
  // Update Supabase Auth metadata
  await userRepository.updateAuthMetadata(userId, {
    name: values.name,
    role: values.role
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
  
  return user;
}

export async function updateUserProfile(userId: string, values: { name: string; role: string }, actorId?: string) {
  // Fetch before state for audit
  const beforeUpdate = await userRepository.findById(userId);
  if (!beforeUpdate) {
    throw new Error(`Utilisateur ${userId} non trouvé`);
  }
  
  // Update user in users table
  const updatedUser = await userRepository.update(userId, {
    name: values.name,
    role: values.role as any // Type assertion for role
  });
  
  // Update Supabase Auth metadata
  await userRepository.updateAuthMetadata(userId, {
    name: values.name,
    role: values.role
  });
  
  // Audit trail: Log user profile update (especially role changes)
  if (actorId) {
    const roleChanged = beforeUpdate.role !== values.role;
    await auditService.logUpdate(
      actorId,
      'user',
      userId,
      { 
        before: { name: beforeUpdate.name, role: beforeUpdate.role },
        after: values,
        role_changed: roleChanged,
        ...(roleChanged && { 
          previous_role: beforeUpdate.role,
          new_role: values.role 
        })
      }
    );
  }
  
  return updatedUser;
}
