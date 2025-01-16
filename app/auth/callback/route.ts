import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Handle error if needed
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // Handle error if needed
            }
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Set remember me cookie if needed
  const cookieStore = await cookies()
  const rememberMe = cookieStore.get('remember_me')?.value === 'true'
  if (rememberMe) {
    await cookieStore.set('remember_me', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return NextResponse.redirect(requestUrl.origin)
}
