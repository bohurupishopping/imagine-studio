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
