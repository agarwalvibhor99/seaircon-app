import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth.service';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!AuthService.checkRateLimit(clientIP, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await AuthService.authenticate(email, password);
    if (!user) {
      // Log failed login attempt
      await AuthService.logSecurityEvent(
        'failed_login_attempt',
        {
          email,
          ip: clientIP,
          userAgent: request.headers.get('user-agent'),
        }
      );

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const session = await AuthService.createSession(user);

    // Log successful login
    await AuthService.logSecurityEvent(
      'successful_login',
      {
        email: user.email,
        role: user.role,
        ip: clientIP,
        userAgent: request.headers.get('user-agent'),
      },
      user.id
    );

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      token: session.sessionToken,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('auth_token', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
