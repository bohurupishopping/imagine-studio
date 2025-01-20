import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authRateLimitMiddleware } from '@/utils/authRateLimiter';
import { authErrorHandler, isAuthError } from '@/utils/authErrorHandler';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Session caching
  const sessionCacheKey = `session-${request.headers.get('x-forwarded-for')}`;
  const cachedSession = await response.cookies.get(sessionCacheKey)?.value;
  
  if (cachedSession) {
    try {
      const session = JSON.parse(cachedSession);
      if (Date.now() < session.expires_at * 1000) {
        // Use cached session if still valid
        return response;
      }
    } catch (error) {
      console.error('Error parsing cached session:', error);
    }
  }

  // Apply rate limiting for auth endpoints
  if (request.nextUrl.pathname.startsWith('/auth')) {
    const rateLimitResponse = authRateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // Get session with error handling
  let session;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    session = data.session;
    
    // Cache valid session
    if (session) {
      response.cookies.set(
        `session-${request.headers.get('x-forwarded-for')}`,
        JSON.stringify(session),
        {
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
          maxAge: session.expires_in
        }
      );
    }
  } catch (error) {
    if (isAuthError(error)) {
      return authErrorHandler(error, request);
    }
    console.error('Auth error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/callback'];
  
  // Redirect authenticated users away from auth pages
  if (session && publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected routes
  const protectedRoutes = ['/dashboard', '/imagine', '/settings'];
  const adminRoutes = [
    '/wp-admin',
    '/wp-admin/designs',
    '/wp-admin/designs/(.*)',
    '/wp-admin/files',
    '/wp-admin/files/(.*)'
  ];
  
  // Check for authentication on protected routes
  if (!session && [...protectedRoutes, ...adminRoutes].some(route =>
    request.nextUrl.pathname.startsWith(route)
  )) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Special handling for admin routes
  if (session && request.nextUrl.pathname.startsWith('/wp-admin')) {
    try {
      // Check for admin role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error || !profile || profile.role !== 'admin') {
        console.log('Access denied - not admin:', { profile, error });
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Redirect root admin path to dashboard
      if (request.nextUrl.pathname === '/wp-admin') {
        return NextResponse.redirect(new URL('/wp-admin/wp-dashboard', request.url));
      }
    } catch (error) {
      console.error('Error in admin check:', error);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
