// Authentication utilities
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signUp(email: string, password: string, metadata: Record<string, any>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function onAuthStateChange(callback: (event: string, session: any | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// Admin role checking utilities
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  
  // Check user metadata for admin role
  const userRole = user.user_metadata?.role;
  return userRole === 'admin';
};

export const requireAdmin = (user: User | null): User => {
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (!isAdmin(user)) {
    throw new Error('Admin access required');
  }
  
  return user;
};

// Get current user with admin check
export const getCurrentAdminUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw error;
  }
  
  return requireAdmin(user);
};

// Admin permissions enum
export enum AdminPermission {
  // User management
  VIEW_USERS = 'view_users',
  MANAGE_USERS = 'manage_users',
  BLOCK_USERS = 'block_users',
  VERIFY_USERS = 'verify_users',
  
  // Content management
  VIEW_REVIEWS = 'view_reviews',
  MODERATE_REVIEWS = 'moderate_reviews',
  VIEW_CHATS = 'view_chats',
  MODERATE_CHATS = 'moderate_chats',
  
  // Financial management
  VIEW_TRANSACTIONS = 'view_transactions',
  APPROVE_FACTORS = 'approve_factors',
  MANAGE_PAYOUTS = 'manage_payouts',
  
  // Analytics
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',
  
  // System management
  MANAGE_SYSTEM = 'manage_system',
  VIEW_LOGS = 'view_logs',
  MANAGE_EMAILS = 'manage_emails'
}

// Check if user has specific permission
export const checkPermission = async (userId: string, permission: AdminPermission): Promise<boolean> => {
  try {
    // First check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin, is_super_admin')
      .eq('id', userId)
      .single();
    
    if (!profile?.is_admin) {
      return false;
    }
    
    // Super admins have all permissions
    if (profile.is_super_admin) {
      return true;
    }
    
    // Check specific permission in admin_permissions table
    const { data: permData } = await supabase
      .from('admin_permissions')
      .select('permissions')
      .eq('user_id', userId)
      .single();
    
    return permData?.permissions?.includes(permission) || false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};
