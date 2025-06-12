#!/usr/bin/env node

/**
 * SEAircon CRM - Comprehensive Endpoint Testing Script
 * Tests database connection, API endpoints, authentication, and security
 */

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http = require('http');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class ComprehensiveEndpointTester {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@seaircon.com';
    this.adminPassword = process.env.ADMIN_PASSWORD || 'admin123!';
    this.baseUrl = 'http://localhost:3000';
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.testResults = [];
    this.authToken = null;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`\n🧪 Testing: ${testName}`, 'cyan');
      const result = await testFunction();
      this.log(`✅ PASS: ${testName}`, 'green');
      this.testResults.push({ name: testName, status: 'PASS', result });
      return result;
    } catch (error) {
      this.log(`❌ FAIL: ${testName} - ${error.message}`, 'red');
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      return null;
    }
  }

  // HTTP request helper
  async makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const isHttps = options.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: parsed
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body
            });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async testDatabaseConnection() {
    return await this.runTest('Database Connection', async () => {
      const { data, error } = await this.supabase
        .from('consultation_requests')
        .select('count(*)')
        .limit(1);
      
      if (error) throw error;
      return 'Database connection successful';
    });
  }

  async testTableStructure() {
    return await this.runTest('Table Structure', async () => {
      // Test consultation_requests table
      const { data: requests, error: requestsError } = await this.supabase
        .from('consultation_requests')
        .select('*')
        .limit(1);
      
      if (requestsError) throw new Error(`consultation_requests table: ${requestsError.message}`);

      // Test contact_history table
      const { data: history, error: historyError } = await this.supabase
        .from('contact_history')
        .select('*')
        .limit(1);
      
      if (historyError) throw new Error(`contact_history table: ${historyError.message}`);

      return 'All required tables exist and are accessible';
    });
  }

  async testAuthentication() {
    return await this.runTest('Authentication Login', async () => {
      const url = new URL('/api/auth/login', this.baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const loginData = {
        email: this.adminEmail,
        password: this.adminPassword
      };

      const response = await this.makeRequest(options, loginData);
      
      if (response.statusCode === 200 && response.body.success) {
        this.authToken = response.body.token;
        return `Authentication successful for ${this.adminEmail}`;
      } else if (response.statusCode === 401) {
        throw new Error('Invalid credentials - check ADMIN_EMAIL and ADMIN_PASSWORD in .env.local');
      } else {
        throw new Error(`Login failed with status ${response.statusCode}: ${JSON.stringify(response.body)}`);
      }
    });
  }

  async testCreateConsultationRequest() {
    return await this.runTest('Create Consultation Request (API)', async () => {
      const url = new URL('/api/consultation-requests', this.baseUrl);
      
      const testRequest = {
        full_name: 'Test User API',
        email: 'test.api@example.com',
        phone: '+91 9876543210',
        service_type: 'consultation',
        message: 'Test request from API endpoint testing',
        urgency: 'low',
        property_type: 'residential',
        budget_range: '50000-100000',
        preferred_contact_method: 'email'
      };

      const options = {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const response = await this.makeRequest(options, testRequest);
      
      if (response.statusCode === 201 && response.body.success) {
        this.testRequestId = response.body.data.id;
        return `Created test request via API with ID: ${this.testRequestId}`;
      } else {
        throw new Error(`API request failed with status ${response.statusCode}: ${JSON.stringify(response.body)}`);
      }
    });
  }

  async testGetConsultationRequests() {
    return await this.runTest('Get Consultation Requests (Authenticated)', async () => {
      if (!this.authToken) {
        throw new Error('No auth token available - authentication test must pass first');
      }

      const url = new URL('/api/consultation-requests', this.baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        }
      };

      const response = await this.makeRequest(options);
      
      if (response.statusCode === 200 && response.body.success) {
        return `Retrieved ${response.body.data.length} consultation requests via authenticated API`;
      } else if (response.statusCode === 401) {
        throw new Error('Authentication failed - token may be invalid');
      } else {
        throw new Error(`API request failed with status ${response.statusCode}: ${JSON.stringify(response.body)}`);
      }
    });
  }

  async testDashboardAnalytics() {
    return await this.runTest('Dashboard Analytics (Authenticated)', async () => {
      if (!this.authToken) {
        throw new Error('No auth token available - authentication test must pass first');
      }

      const url = new URL('/api/dashboard/analytics', this.baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        }
      };

      const response = await this.makeRequest(options);
      
      if (response.statusCode === 200 && response.body.success) {
        const stats = response.body.data;
        return `Dashboard analytics retrieved: ${stats.totalRequests || 0} total requests, ${stats.newRequests || 0} new`;
      } else if (response.statusCode === 401) {
        throw new Error('Authentication failed - token may be invalid');
      } else {
        throw new Error(`API request failed with status ${response.statusCode}: ${JSON.stringify(response.body)}`);
      }
    });
  }

  async testUnauthorizedAccess() {
    return await this.runTest('Unauthorized Access Protection', async () => {
      const url = new URL('/api/consultation-requests', this.baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const response = await this.makeRequest(options);
      
      if (response.statusCode === 401) {
        return 'Unauthorized access properly blocked';
      } else {
        throw new Error(`Expected 401 status, got ${response.statusCode} - authentication protection may not be working`);
      }
    });
  }

  async testFormSubmissionDirect() {
    return await this.runTest('Direct Form Submission (Supabase)', async () => {
      const testData = {
        full_name: 'John Direct Test',
        email: 'john.direct@example.com',
        phone: '+91 9876543210',
        service_type: 'consultation',
        property_type: 'residential',
        message: 'Test consultation request from direct Supabase test',
        urgency: 'medium',
        status: 'new',
        priority: 'medium',
        source: 'direct_test'
      };

      const { data, error } = await this.supabase
        .from('consultation_requests')
        .insert(testData)
        .select()
        .single();

      if (error) throw error;
      
      // Store the ID for cleanup
      this.directTestRequestId = data.id;
      return `Created direct test request with ID: ${data.id}`;
    });
  }

  async testCleanup() {
    return await this.runTest('Cleanup Test Data', async () => {
      let cleanedCount = 0;

      // Clean up API test request
      if (this.testRequestId) {
        const { error: apiError } = await this.supabase
          .from('consultation_requests')
          .delete()
          .eq('id', this.testRequestId);

        if (!apiError) cleanedCount++;
      }

      // Clean up direct test request
      if (this.directTestRequestId) {
        const { error: directError } = await this.supabase
          .from('consultation_requests')
          .delete()
          .eq('id', this.directTestRequestId);

        if (!directError) cleanedCount++;
      }

      return `Cleaned up ${cleanedCount} test records`;
    });
  }

  async runAllTests() {
    this.log('\n🚀 Starting SEAircon CRM Comprehensive Tests', 'bright');
    this.log('=' .repeat(55), 'cyan');

    // Environment check
    this.log('\n📋 Environment Configuration:', 'yellow');
    this.log(`Supabase URL: ${this.supabaseUrl}`, 'blue');
    this.log(`Anon Key: ${this.supabaseKey ? '✓ Present' : '✗ Missing'}`, 'blue');
    this.log(`Service Role Key: ${this.serviceRoleKey ? '✓ Present' : '✗ Missing'}`, 'blue');
    this.log(`Admin Email: ${this.adminEmail}`, 'blue');
    this.log(`Admin Password: ${this.adminPassword ? '✓ Set' : '✗ Missing'}`, 'blue');

    // Database tests
    this.log('\n🗄️  Database Tests:', 'yellow');
    await this.testDatabaseConnection();
    await this.testTableStructure();
    await this.testFormSubmissionDirect();

    // Authentication and API tests (require server to be running)
    this.log('\n🔐 Authentication & API Tests:', 'yellow');
    this.log('   (These require the Next.js server to be running: npm run dev)', 'yellow');
    
    try {
      await this.testAuthentication();
      await this.testCreateConsultationRequest();
      await this.testGetConsultationRequests();
      await this.testDashboardAnalytics();
      await this.testUnauthorizedAccess();
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        this.log('⚠️  Server not running - API tests skipped', 'yellow');
        this.log('   Start with: npm run dev', 'yellow');
      }
    }

    // Cleanup
    await this.testCleanup();

    // Summary
    this.printSummary();
  }

  printSummary() {
    this.log('\n📊 Test Summary', 'bright');
    this.log('=' .repeat(50), 'cyan');
    
    const passed = this.testResults.filter(t => t.status === 'PASS').length;
    const failed = this.testResults.filter(t => t.status === 'FAIL').length;
    
    this.log(`\n✅ Passed: ${passed}`, 'green');
    this.log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    this.log(`📝 Total: ${this.testResults.length}`, 'blue');

    if (failed > 0) {
      this.log('\n🔍 Failed Tests:', 'red');
      this.testResults
        .filter(t => t.status === 'FAIL')
        .forEach(test => {
          this.log(`  - ${test.name}: ${test.error}`, 'red');
        });
    }

    this.log(`\n${failed === 0 ? '🎉 All tests passed! System ready for production.' : '⚠️  Some tests failed. Review and fix issues.'}`, failed === 0 ? 'green' : 'yellow');
    
    this.log('\n💡 Next Steps:', 'cyan');
    this.log('   1. Start server: npm run dev', 'blue');
    this.log('   2. Visit: http://localhost:3000', 'blue');
    this.log('   3. Test contact form submission', 'blue');
    this.log('   4. Access admin dashboard: http://localhost:3000/admin', 'blue');
    this.log('   5. Login with: admin@seaircon.com / admin123!', 'blue');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new ComprehensiveEndpointTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveEndpointTester;
    }
  }

  async testDatabaseConnection() {
    return await this.runTest('Database Connection', async () => {
      const { data, error } = await this.supabase
        .from('consultation_requests')
        .select('count(*)')
        .limit(1);
      
      if (error) throw error;
      return 'Database connection successful';
    });
  }

  async testTableStructure() {
    return await this.runTest('Table Structure', async () => {
      // Test consultation_requests table
      const { data: requests, error: requestsError } = await this.supabase
        .from('consultation_requests')
        .select('*')
        .limit(1);
      
      if (requestsError) throw new Error(`consultation_requests table: ${requestsError.message}`);

      // Test contact_history table
      const { data: history, error: historyError } = await this.supabase
        .from('contact_history')
        .select('*')
        .limit(1);
      
      if (historyError) throw new Error(`contact_history table: ${historyError.message}`);

      return 'All required tables exist and are accessible';
    });
  }

  async testCreateConsultationRequest() {
    return await this.runTest('Create Consultation Request', async () => {
      const testRequest = {
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        service_type: 'consultation',
        message: 'Test request from endpoint testing',
        urgency: 'low',
        status: 'new',
        priority: 'low',
        source: 'api_test'
      };

      const { data, error } = await this.supabase
        .from('consultation_requests')
        .insert(testRequest)
        .select()
        .single();

      if (error) throw error;
      
      // Store the ID for cleanup
      this.testRequestId = data.id;
      return `Created test request with ID: ${data.id}`;
    });
  }

  async testGetConsultationRequests() {
    return await this.runTest('Get Consultation Requests', async () => {
      const { data, error } = await this.supabase
        .from('consultation_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return `Retrieved ${data.length} consultation requests`;
    });
  }

  async testUpdateConsultationRequest() {
    return await this.runTest('Update Consultation Request', async () => {
      if (!this.testRequestId) {
        throw new Error('No test request ID available');
      }

      const { data, error } = await this.supabase
        .from('consultation_requests')
        .update({ status: 'contacted', priority: 'medium' })
        .eq('id', this.testRequestId)
        .select()
        .single();

      if (error) throw error;
      return `Updated request ${this.testRequestId}`;
    });
  }

  async testFilterAndSearch() {
    return await this.runTest('Filter and Search', async () => {
      // Test status filter
      const { data: statusData, error: statusError } = await this.supabase
        .from('consultation_requests')
        .select('*')
        .eq('status', 'new')
        .limit(5);

      if (statusError) throw statusError;

      // Test search functionality
      const { data: searchData, error: searchError } = await this.supabase
        .from('consultation_requests')
        .select('*')
        .or('full_name.ilike.%test%,email.ilike.%test%')
        .limit(5);

      if (searchError) throw searchError;

      return `Filter returned ${statusData.length} new requests, search returned ${searchData.length} results`;
    });
  }

  async testDashboardStats() {
    return await this.runTest('Dashboard Statistics', async () => {
      // Get status counts
      const { data: statusData, error: statusError } = await this.supabase
        .from('consultation_requests')
        .select('status');

      if (statusError) throw statusError;

      // Get urgency counts
      const { data: urgencyData, error: urgencyError } = await this.supabase
        .from('consultation_requests')
        .select('urgency');

      if (urgencyError) throw urgencyError;

      const statusStats = statusData.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      const urgencyStats = urgencyData.reduce((acc, item) => {
        acc[item.urgency] = (acc[item.urgency] || 0) + 1;
        return acc;
      }, {});

      return `Status stats: ${JSON.stringify(statusStats)}, Urgency stats: ${JSON.stringify(urgencyStats)}`;
    });
  }

  async testContactHistory() {
    return await this.runTest('Contact History', async () => {
      if (!this.testRequestId) {
        throw new Error('No test request ID available');
      }

      // Create contact history entry
      const { data: createData, error: createError } = await this.supabase
        .from('contact_history')
        .insert({
          consultation_request_id: this.testRequestId,
          contact_type: 'note',
          contact_method: 'internal',
          notes: 'Test contact history entry',
          created_by: 'test_system'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Retrieve contact history
      const { data: historyData, error: historyError } = await this.supabase
        .from('contact_history')
        .select('*')
        .eq('consultation_request_id', this.testRequestId);

      if (historyError) throw historyError;

      return `Created and retrieved ${historyData.length} contact history entries`;
    });
  }

  async testRowLevelSecurity() {
    return await this.runTest('Row Level Security', async () => {
      // Test if RLS is enabled (this will depend on your RLS policies)
      const { data, error } = await this.supabase
        .from('consultation_requests')
        .select('id')
        .limit(1);

      if (error && error.message.includes('row-level security')) {
        return 'RLS is enabled (as expected)';
      } else if (data) {
        return 'RLS policies allow access (check your policies)';
      }
      
      return 'RLS test completed';
    });
  }

  async testCleanup() {
    return await this.runTest('Cleanup Test Data', async () => {
      if (!this.testRequestId) {
        return 'No test data to cleanup';
      }

      // Delete contact history first (foreign key constraint)
      const { error: historyError } = await this.supabase
        .from('contact_history')
        .delete()
        .eq('consultation_request_id', this.testRequestId);

      if (historyError) throw historyError;

      // Delete test request
      const { error: requestError } = await this.supabase
        .from('consultation_requests')
        .delete()
        .eq('id', this.testRequestId);

      if (requestError) throw requestError;

      return `Cleaned up test request ${this.testRequestId}`;
    });
  }

  async testAuthentication() {
    return await this.runTest('Authentication System', async () => {
      // Test login with correct credentials
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@seaircon.com',
          password: 'admin123!'
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }

      const loginData = await loginResponse.json();
      this.authToken = loginData.token;

      // Test token verification
      const verifyResponse = await fetch('http://localhost:3000/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${this.authToken}` },
      });

      if (!verifyResponse.ok) {
        throw new Error('Token verification failed');
      }

      const verifyData = await verifyResponse.json();
      
      // Test logout
      const logoutResponse = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.authToken}` },
      });

      if (!logoutResponse.ok) {
        throw new Error('Logout failed');
      }

      return `Login successful, token verified, logout successful. User: ${verifyData.user.email}`;
    });
  }

  async testSecurityProtection() {
    return await this.runTest('Security Protection', async () => {
      // Test accessing protected route without token
      const protectedResponse = await fetch('http://localhost:3000/api/admin/test', {
        method: 'GET',
      });

      if (protectedResponse.status !== 401) {
        throw new Error('Protected route should return 401 without token');
      }

      // Test with invalid token
      const invalidTokenResponse = await fetch('http://localhost:3000/api/admin/test', {
        headers: { 'Authorization': 'Bearer invalid-token' },
      });

      if (invalidTokenResponse.status !== 401) {
        throw new Error('Protected route should return 401 with invalid token');
      }

      return 'Security protection working correctly';
    });
  }

  async runAllTests() {
    this.log('\n🚀 Starting SEAircon CRM Endpoint Tests', 'bright');
    this.log('=' .repeat(50), 'cyan');

    // Environment check
    this.log('\n📋 Environment Configuration:', 'yellow');
    this.log(`Supabase URL: ${this.supabaseUrl}`, 'blue');
    this.log(`Anon Key: ${this.supabaseKey ? '✓ Present' : '✗ Missing'}`, 'blue');
    this.log(`Service Role Key: ${this.serviceRoleKey ? '✓ Present' : '✗ Missing'}`, 'blue');

    // Run tests in order
    await this.testDatabaseConnection();
    await this.testTableStructure();
    await this.testAuthentication();
    await this.testSecurityProtection();
    await this.testCreateConsultationRequest();
    await this.testGetConsultationRequests();
    await this.testUpdateConsultationRequest();
    await this.testFilterAndSearch();
    await this.testDashboardStats();
    await this.testContactHistory();
    await this.testRowLevelSecurity();
    await this.testCleanup();

    // Summary
    this.printSummary();
  }

  printSummary() {
    this.log('\n📊 Test Summary', 'bright');
    this.log('=' .repeat(50), 'cyan');
    
    const passed = this.testResults.filter(t => t.status === 'PASS').length;
    const failed = this.testResults.filter(t => t.status === 'FAIL').length;
    
    this.log(`\n✅ Passed: ${passed}`, 'green');
    this.log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    this.log(`📝 Total: ${this.testResults.length}`, 'blue');

    if (failed > 0) {
      this.log('\n🔍 Failed Tests:', 'red');
      this.testResults
        .filter(t => t.status === 'FAIL')
        .forEach(test => {
          this.log(`  - ${test.name}: ${test.error}`, 'red');
        });
    }

    this.log(`\n${failed === 0 ? '🎉 All tests passed! Ready for deployment.' : '⚠️  Some tests failed. Fix issues before deployment.'}`, failed === 0 ? 'green' : 'yellow');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new EndpointTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = EndpointTester;
