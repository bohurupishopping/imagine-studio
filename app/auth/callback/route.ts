import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Set remember me cookie if needed
  const cookieStore = cookies();
  const rememberMe = cookieStore.get('remember_me')?.value === 'true';
  if (rememberMe) {
    cookies().set('remember_me', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return NextResponse.redirect(requestUrl.origin);
}
