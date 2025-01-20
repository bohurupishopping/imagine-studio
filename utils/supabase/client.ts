import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => {
  const client = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: 'sb-auth-token',
      flowType: 'pkce',
    }
  })

  // Add token refresh event listener
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed at:', new Date().toISOString())
    }
    if (event === 'SIGNED_IN') {
      console.log('User signed in at:', new Date().toISOString())
    }
  })

  return client
}
