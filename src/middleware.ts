import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't need auth
  const publicRoutes = [
    '/',
    '/login',
    '/admin/login',
    '/api/contact',
    '/signup'
  ];
  
  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For admin routes, check authentication
  if (pathname.startsWith('/admin')) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const redirectUrl = new URL('/admin/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }
      
      // Check if user is an employee
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('email', session.user.email)
        .single();
        
      if (!employee || !employee.is_active) {
        const redirectUrl = new URL('/admin/login', request.url);
        redirectUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(redirectUrl);
      }
      
    } catch (error) {
      console.error('Middleware error:', error);
      const redirectUrl = new URL('/admin/login', request.url);
      redirectUrl.searchParams.set('error', 'auth_error');
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
