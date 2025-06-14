import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for Next.js internal routes and static assets
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.includes('.') // Files with extensions
    ) {
      return NextResponse.next();
    }
    
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
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name) => request.cookies.get(name)?.value,
            set: (name, value, options) => {
              res.cookies.set({ name, value, ...options });
            },
            remove: (name, options) => {
              res.cookies.set({ name, value: '', ...options });
            },
          },
        }
      );
      
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
        console.error('Middleware auth error:', error);
        const redirectUrl = new URL('/admin/login', request.url);
        redirectUrl.searchParams.set('error', 'auth_error');
        return NextResponse.redirect(redirectUrl);
      }
    }
    
    return NextResponse.next();
  } catch (err) {
    console.error('Middleware unexpected error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
