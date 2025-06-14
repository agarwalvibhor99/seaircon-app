# SEAircon Security Implementation Guide

## 🔐 Security Features Implemented

### 1. Authentication System
- **JWT-based authentication** with secure token generation
- **Rate limiting** to prevent brute force attacks (5 attempts per 15 minutes)
- **Secure HTTP-only cookies** for token storage
- **Development admin credentials** for testing
- **Session validation** with token expiration

### 2. Authorization & Access Control
- **Role-based access control** (admin/user roles)
- **Route protection** via Next.js middleware
- **Permission checking** for sensitive operations
- **Admin-only access** to CRM dashboard and APIs

### 3. Security Middleware
- **Request validation** on all protected routes
- **Token verification** for API endpoints
- **Automatic redirects** for unauthorized access
- **Security headers** on sensitive routes
- **IP-based rate limiting**

### 4. Data Protection
- **Input validation** on all forms and APIs
- **SQL injection prevention** via Supabase parameterized queries
- **XSS protection** with proper input sanitization
- **CSRF protection** with SameSite cookies

## 🚀 Production Deployment Security

### Environment Variables (Required)
```env
# Authentication
NEXTAUTH_SECRET=your-secure-32-character-secret-key
ADMIN_EMAIL=your-admin-email@company.com
ADMIN_PASSWORD=your-strong-admin-password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
```

### Security Checklist for Production

#### ✅ Authentication
- [ ] Change default admin credentials
- [ ] Use strong, unique passwords (min 12 characters)
- [ ] Set secure NEXTAUTH_SECRET (32+ characters)
- [ ] Enable HTTPS for all routes
- [ ] Configure proper CORS policies

#### ✅ Database Security
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Configure proper database permissions
- [ ] Set up database backups
- [ ] Monitor suspicious database activity
- [ ] Use service role key only on server-side

#### ✅ Infrastructure
- [ ] Use HTTPS certificates (SSL/TLS)
- [ ] Configure security headers
- [ ] Set up firewall rules
- [ ] Enable logging and monitoring
- [ ] Use secure hosting environment

#### ✅ Application Security
- [ ] Validate all user inputs
- [ ] Sanitize data before display
- [ ] Use parameterized queries
- [ ] Implement proper error handling
- [ ] Remove debug information in production

## 🔧 Security Configuration

### 1. Supabase Row Level Security (RLS)
Add these policies to your Supabase database:

```sql
-- Enable RLS on consultation_requests table
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all requests
CREATE POLICY "Admin can read all consultation requests" 
ON consultation_requests FOR SELECT 
TO authenticated 
USING (true);

-- Policy for authenticated users to insert requests
CREATE POLICY "Admin can insert consultation requests" 
ON consultation_requests FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy for authenticated users to update requests
CREATE POLICY "Admin can update consultation requests" 
ON consultation_requests FOR UPDATE 
TO authenticated 
USING (true);

-- Enable RLS on contact_history table
ALTER TABLE contact_history ENABLE ROW LEVEL SECURITY;

-- Similar policies for contact_history
CREATE POLICY "Admin can read all contact history" 
ON contact_history FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admin can insert contact history" 
ON contact_history FOR INSERT 
TO authenticated 
WITH CHECK (true);
```

### 2. Security Headers Configuration
Add to `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 3. Rate Limiting Configuration
Current limits (configurable in `auth.service.ts`):
- **Login attempts**: 5 per 15 minutes per IP
- **API requests**: Configurable per endpoint
- **Session duration**: 30 days (configurable)

## 🛡️ Security Monitoring

### 1. Security Events Logged
- Failed login attempts
- Successful logins
- Unauthorized access attempts
- Token validation failures
- Admin access events

### 2. Monitoring Setup
```javascript
// Example: Set up alerts for security events
const securityEvents = [
  'failed_login_attempt',
  'unauthorized_access_attempt',
  'token_validation_failure',
];

// In production, send these to your monitoring service
// (e.g., Sentry, LogRocket, DataDog)
```

## 🔍 Security Testing

### Automated Security Tests
Run the security test suite:
```bash
npm run test:security
node test-endpoints.js
```

### Manual Security Testing
1. **Authentication Testing**
   - Try accessing `/admin` without login
   - Test with invalid credentials
   - Test session expiration
   - Test logout functionality

2. **Authorization Testing**
   - Try accessing admin APIs without admin role
   - Test with expired tokens
   - Test with malformed tokens

3. **Input Validation Testing**
   - Test with malicious inputs (XSS, SQL injection)
   - Test with oversized requests
   - Test with missing required fields

## 🚨 Incident Response

### If Security Breach Detected
1. **Immediate Actions**
   - Invalidate all active sessions
   - Change admin credentials
   - Review security logs
   - Block suspicious IPs

2. **Investigation**
   - Check database for unauthorized changes
   - Review application logs
   - Analyze attack vectors
   - Document findings

3. **Recovery**
   - Patch security vulnerabilities
   - Update security policies
   - Notify affected users
   - Implement additional monitoring

## 📞 Support & Security Updates

For security issues or questions:
- Review this documentation
- Check GitHub security advisories
- Update dependencies regularly
- Monitor security best practices

**Remember**: Security is an ongoing process. Regularly review and update your security measures.

---

*Last updated: [Current Date]*
*Security implementation version: 1.0*
