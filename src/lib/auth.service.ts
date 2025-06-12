/**
 * SEAircon Authentication Service
 * Handles user authentication, session management, and security
 */

import { createHash, randomBytes } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { AuthUser, AuthSession, authConfig } from './auth.config';
import { supabase, createServerSupabaseClient } from './supabase';

export class AuthService {
  private static jwtSecret = new TextEncoder().encode(authConfig.jwt.secret);

  // Hash password for storage (in production, use bcrypt or similar)
  static hashPassword(password: string, salt?: string): string {
    const actualSalt = salt || randomBytes(16).toString('hex');
    const hash = createHash('sha256')
      .update(password + actualSalt)
      .digest('hex');
    return `${actualSalt}:${hash}`;
  }

  // Verify password against stored hash
  static verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');
    const computedHash = createHash('sha256')
      .update(password + salt)
      .digest('hex');
    return hash === computedHash;
  }

  // Create JWT token
  static async createToken(user: AuthUser): Promise<string> {
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Date.now() + authConfig.jwt.maxAge * 1000)
      .sign(this.jwtSecret);

    return token;
  }

  // Verify JWT token
  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret);
      
      return {
        id: payload.sub as string,
        email: payload.email as string,
        role: payload.role as 'admin' | 'user',
        name: payload.name as string,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Authenticate user with email/password
  static async authenticate(email: string, password: string): Promise<AuthUser | null> {
    try {
      // Check against admin credentials first (for development)
      if (email === authConfig.adminCredentials.email) {
        if (password === authConfig.adminCredentials.password) {
          return {
            id: 'admin-user',
            email: authConfig.adminCredentials.email,
            role: 'admin',
            name: 'Administrator',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          };
        }
        return null;
      }

      // In production, you would check against a users table in Supabase
      // For now, we'll use the admin credentials system
      
      return null;
    } catch (error) {
      console.error('Authentication failed:', error);
      return null;
    }
  }

  // Create session
  static async createSession(user: AuthUser): Promise<AuthSession> {
    const sessionToken = await this.createToken(user);
    const expires = new Date(Date.now() + authConfig.session.maxAge * 1000).toISOString();
    
    // Update last login
    user.last_login = new Date().toISOString();
    
    return {
      user,
      expires,
      sessionToken,
    };
  }

  // Validate session
  static async validateSession(sessionToken: string): Promise<AuthSession | null> {
    try {
      const user = await this.verifyToken(sessionToken);
      if (!user) return null;

      const expires = new Date(Date.now() + authConfig.session.maxAge * 1000).toISOString();
      
      return {
        user,
        expires,
        sessionToken,
      };
    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  // Check if route requires authentication
  static requiresAuth(pathname: string): boolean {
    // First check if it's explicitly a public route
    if (this.isPublicRoute(pathname)) {
      return false;
    }
    
    // Then check if it requires auth
    return authConfig.protectedRoutes.some(route => 
      pathname.startsWith(route)
    );
  }

  // Check if route is public
  static isPublicRoute(pathname: string): boolean {
    return authConfig.publicRoutes.some(route => {
      // Exact match
      if (pathname === route) return true;
      
      // For routes ending with *, check if pathname starts with the route prefix
      if (route.endsWith('*')) {
        return pathname.startsWith(route.slice(0, -1));
      }
      
      // For specific paths, only exact matches
      return false;
    });
  }

  // Log security event
  static async logSecurityEvent(
    event: string, 
    details: any, 
    userId?: string
  ): Promise<void> {
    try {
      const serverClient = createServerSupabaseClient();
      
      // In production, you might want to create a security_logs table
      console.log('Security Event:', {
        event,
        details,
        userId,
        timestamp: new Date().toISOString(),
        ip: details.ip || 'unknown',
        userAgent: details.userAgent || 'unknown',
      });
      
      // Could store in Supabase for audit trail
      // await serverClient.from('security_logs').insert({...})
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Rate limiting helper
  static rateLimitCache = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const entry = this.rateLimitCache.get(identifier);

    if (!entry || now > entry.resetTime) {
      this.rateLimitCache.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }
}

// Middleware helper for Next.js API routes
export const withAuth = (handler: any) => {
  return async (req: any, res: any) => {
    try {
      // Check rate limiting
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
      if (!AuthService.checkRateLimit(clientIP)) {
        return res.status(429).json({ error: 'Too many requests' });
      }

      // Get token from Authorization header or cookie
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.slice(7)
        : req.cookies?.auth_token;

      if (!token) {
        return res.status(401).json({ error: 'No authentication token provided' });
      }

      // Validate session
      const session = await AuthService.validateSession(token);
      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // Add user to request object
      req.user = session.user;
      req.session = session;

      // Add security headers
      Object.entries(authConfig.pages).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Authentication error' });
    }
  };
};

// Role-based authorization helper
export const withRole = (requiredRole: 'admin' | 'user') => {
  return (handler: any) => {
    return withAuth(async (req: any, res: any) => {
      if (req.user.role !== requiredRole && requiredRole === 'admin') {
        await AuthService.logSecurityEvent(
          'unauthorized_access_attempt',
          {
            path: req.url,
            method: req.method,
            userRole: req.user.role,
            requiredRole,
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
          },
          req.user.id
        );
        
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      return handler(req, res);
    });
  };
};

// Helper function to verify token from API request
export async function verifyToken(request: NextRequest): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Try to get token from Authorization header or cookie
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      token = request.cookies.get('auth_token')?.value || request.cookies.get('auth-token')?.value;
    }

    if (!token) {
      return { success: false, error: 'No authentication token provided' };
    }

    const user = await AuthService.verifyToken(token);
    
    if (!user) {
      return { success: false, error: 'Invalid or expired token' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Token verification error:', error);
    return { success: false, error: 'Token verification failed' };
  }
}
