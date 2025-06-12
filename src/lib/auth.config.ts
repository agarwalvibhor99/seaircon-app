/**
 * SEAircon Authentication Configuration
 * Centralizes authentication settings and user validation
 */

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  created_at: string;
  last_login?: string;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
  sessionToken: string;
}

// Environment-based configuration
export const authConfig = {
  // Session settings
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  // JWT settings
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Admin credentials (for development - use proper auth provider in production)
  adminCredentials: {
    email: process.env.ADMIN_EMAIL || 'admin@seaircon.com',
    password: process.env.ADMIN_PASSWORD || 'admin123!',
    role: 'admin' as const,
  },
  
  // Protected routes that require authentication
  protectedRoutes: [
    '/admin/dashboard',
    '/admin/leads',
    '/admin/projects', 
    '/admin/quotations',
    '/admin/invoicing',
    '/admin/installations',
    '/admin/amc',
    '/admin/site-visits',
    '/admin/reports',
    '/admin/settings',
    '/api/admin',
    '/api/consultation-requests',
    '/api/contact-history',
  ],
  
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/api/contact',
    '/login',
    '/admin/login',
    '/signup',
  ],
  
  // Redirect URLs
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login?error=auth_error',
  },
  
  // Role-based access control
  permissions: {
    admin: [
      'read:consultation_requests',
      'write:consultation_requests',
      'delete:consultation_requests',
      'read:contact_history',
      'write:contact_history',
      'read:analytics',
      'manage:users',
    ],
    user: [
      'read:own_requests',
      'write:own_requests',
    ],
  },
};

// Helper functions for role checking
export const hasPermission = (user: AuthUser | null, permission: string): boolean => {
  if (!user) return false;
  
  const userPermissions = authConfig.permissions[user.role] || [];
  return userPermissions.includes(permission);
};

export const isAdmin = (user: AuthUser | null): boolean => {
  return user?.role === 'admin';
};

export const isAuthenticated = (session: AuthSession | null): boolean => {
  return !!session?.user && new Date(session.expires) > new Date();
};

// Security headers for admin routes
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
