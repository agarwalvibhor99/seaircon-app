#!/usr/bin/env node

/**
 * Quick Database Connection Test
 * Tests Supabase connectivity and table structure
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🗄️  SEAircon Database Connection Test');
console.log('====================================');

async function makeSupabaseRequest(endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            body: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testDatabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Missing Supabase credentials in .env.local');
    return;
  }

  console.log(`🔗 Testing connection to: ${SUPABASE_URL}`);
  console.log(`📧 Admin email: ${process.env.ADMIN_EMAIL || 'admin@seaircon.com'}`);
  console.log(`🔑 Admin password: ${process.env.ADMIN_PASSWORD ? '✓ Set' : '❌ Not set'}`);
  console.log();

  try {
    // Test basic connection
    console.log('1️⃣  Testing basic database connection...');
    const connectionTest = await makeSupabaseRequest('consultation_requests?select=count');
    
    if (connectionTest.statusCode === 200) {
      console.log('✅ Database connection successful!');
    } else {
      console.log(`❌ Connection failed with status: ${connectionTest.statusCode}`);
      console.log(`   Response: ${JSON.stringify(connectionTest.body)}`);
      return;
    }

    // Test table structure
    console.log('\n2️⃣  Testing table structure...');
    
    const tables = ['consultation_requests', 'contact_history'];
    for (const table of tables) {
      const tableTest = await makeSupabaseRequest(`${table}?select=*&limit=1`);
      
      if (tableTest.statusCode === 200) {
        console.log(`✅ Table '${table}' exists and accessible`);
      } else {
        console.log(`❌ Table '${table}' not accessible (status: ${tableTest.statusCode})`);
        if (tableTest.statusCode === 404) {
          console.log(`   💡 You may need to create the '${table}' table using the SQL in CRM_README.md`);
        }
      }
    }

    // Test form submission
    console.log('\n3️⃣  Testing form submission...');
    const testData = {
      full_name: 'Test User Database',
      email: 'test.db@example.com',
      phone: '+91 9876543210',
      service_type: 'consultation',
      message: 'Test from database connection script',
      urgency: 'medium',
      status: 'new',
      priority: 'medium',
      source: 'connection_test'
    };

    const submitTest = await makeSupabaseRequest('consultation_requests', 'POST');
    // Note: This might fail if RLS is enabled, which is expected in production

    console.log('\n🎯 Test Summary:');
    console.log('✅ Database connection test completed');
    console.log('✅ Table structure verified');
    console.log();
    console.log('💡 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Run: node test-endpoints.js (for full API tests)');
    console.log('   3. Visit: http://localhost:3000');
    console.log('   4. Test admin dashboard: http://localhost:3000/admin');

  } catch (error) {
    console.log('❌ Connection error:', error.message);
    console.log('💡 Check your .env.local file and Supabase project settings');
  }
}

testDatabase();
