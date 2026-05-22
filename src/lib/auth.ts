import { supabase } from '@/lib/supabase';
import { AdminUser, AuthSession } from '@/types';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, session: null };
  }

  if (data.session) {
    return { session: data.session, error: null };
  }

  return { error: 'No session returned', session: null };
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  // Fetch admin user details from admin_users table
  const { data: adminUser, error: userError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (userError) {
    console.error('Error fetching admin user:', userError);
    return null;
  }

  return adminUser as AdminUser;
}

export async function getSession(): Promise<AuthSession | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return null;
  }

  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return {
    user,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  };
}

export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();

  if (error || !data.session) {
    return { error: error?.message || 'Failed to refresh session', session: null };
  }

  return { session: data.session, error: null };
}

export async function resetPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });
}

export async function updatePassword(newPassword: string) {
  return await supabase.auth.updateUser({ password: newPassword });
}

export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
