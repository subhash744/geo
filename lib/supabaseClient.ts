import { createClient } from '@supabase/supabase-js'

// Supabase configuration - these will be set in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate that we have the required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not configured. Authentication will not work.')
  console.warn('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
}

// Create the Supabase client
// Only create client if we have both URL and key to prevent runtime errors
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Create a mock client for development
  supabase = {
    auth: {
      signUp: async () => ({ error: { message: 'Supabase not configured' }, data: null }),
      signInWithPassword: async () => ({ error: { message: 'Supabase not configured' }, data: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      verifyOtp: async () => ({ error: { message: 'Supabase not configured' }, data: null }),
    }
  } as any
}

export { supabase }

export default supabase