import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Client for authentication and session management
export const createClient = async () => {
  const cookieStore = await cookies()
  
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key) => cookieStore.get(key)?.value ?? null,
          setItem: (key, value) => {
            try {
              cookieStore.set({ name: key, value, path: '/' })
            } catch (error) {
              // Handle error silently
            }
          },
          removeItem: (key) => {
            try {
              cookieStore.delete(key)
            } catch (error) {
              // Handle error silently
            }
          }
        }
      }
    }
  )
}

// Service client for elevated permissions
export const createServiceClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
