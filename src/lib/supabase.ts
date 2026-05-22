import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side client for sensitive operations
export function createSupabaseServerClient() {
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL not set');
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set for server operations');
  }
  
  const key = serviceRoleKey || supabaseKey;
  if (!key) throw new Error('No valid Supabase key available');
  
  return createClient(supabaseUrl, key);
}
