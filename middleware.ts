import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  const { data: { session } } = await supabase.auth.getSession();
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/callback'];
  
  // Redirect authenticated users away from auth pages
  if (session && publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected routes
  const protectedRoutes = ['/dashboard', '/imagine', '/settings'];
  
  // Redirect unauthenticated users from protected routes
  if (!session && protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Set auth header for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set(
      'Authorization',
      `Bearer ${session?.access_token}`
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
