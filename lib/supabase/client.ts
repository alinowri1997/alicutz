/**
 * Supabase Client Configuration
 * Server-side and client-side Supabase clients
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Validate Supabase configuration
 */
function validateSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    throw new Error(
      `Missing Supabase configuration: ${missing.join(', ')}. ` +
        `Please check your .env.local file.`
    );
  }
}

/**
 * Browser client for client-side operations
 * Lazily initialized to avoid errors during build
 */
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    validateSupabaseConfig();
    browserClient = createClient(supabaseUrl!, supabaseAnonKey!);
  }
  return browserClient;
}

/**
 * Server client for server-side operations (with service role)
 */
export function getSupabaseServer(): SupabaseClient {
  validateSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
  const client = getSupabaseBrowser();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session?.user;
}

/**
 * Sign up with email
 */
export async function signUpWithEmail(email: string, password: string) {
  const client = getSupabaseBrowser();
  const { data, error } = await client.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign in with email
 */
export async function signInWithEmail(email: string, password: string) {
  const client = getSupabaseBrowser();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const client = getSupabaseBrowser();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}


