// Debug script to test form submission
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local manually
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.trim().split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        envVars[key] = value;
      }
    });
    
    // Set environment variables
    Object.keys(envVars).forEach(key => {
      process.env[key] = envVars[key];
    });
    
    return true;
  } catch (error) {
    console.log('❌ Could not load .env.local file:', error.message);
    return false;
  }
}

console.log('🔍 Debug Form Submission');
console.log('========================');

// Load environment variables
const envLoaded = loadEnvFile();

// Check environment variables
console.log('Environment check:');
console.log('- Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('- Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testFormSubmission() {
  try {
    console.log('\n📋 Testing form submission...');
    
    // Test data - exactly what the form would send
    const requestData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      company: 'Test Company',
      service_type: 'consultation',
      message: 'This is a test submission',
      urgency_level: 'medium',
      status: 'new',
      source: 'website',
    };

    console.log('Request data:', JSON.stringify(requestData, null, 2));

    // Try to insert the data
    const { data: result, error } = await supabase
      .from('consultation_requests')
      .insert(requestData)
      .select()
      .single();

    if (error) {
      console.log('❌ Insert error:', error);
      console.log('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('✅ Insert successful!');
      console.log('Result:', result);
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

async function checkTableExists() {
  try {
    console.log('\n🔍 Checking if table exists...');
    
    const { data, error } = await supabase
      .from('consultation_requests')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Table check error:', error);
      return false;
    } else {
      console.log('✅ Table exists and is accessible');
      return true;
    }
  } catch (err) {
    console.log('❌ Table check failed:', err);
    return false;
  }
}

async function main() {
  const tableExists = await checkTableExists();
  
  if (tableExists) {
    await testFormSubmission();
  } else {
    console.log('\n❗ Please create the database tables first using the SQL script:');
    console.log('   supabase-schema.sql');
  }
}

main();
