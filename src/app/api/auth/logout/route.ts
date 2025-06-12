import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth.service';

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7)
      : request.cookies.get('auth_token')?.value;

    let userId = 'unknown';

    if (token) {
      // Validate session to get user info for logging
      const session = await AuthService.validateSession(token);
      if (session) {
        userId = session.user.id;
        
        // Log logout event
        await AuthService.logSecurityEvent(
          'user_logout',
          {
            email: session.user.email,
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent'),
          },
          userId
        );
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear the auth cookie
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
