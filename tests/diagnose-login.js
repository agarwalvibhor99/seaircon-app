#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auvgmprjwtyurxswsvwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dmdtcHJqd3R5dXJ4c3dzdndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MTMxNzksImV4cCI6MjA2Mzk4OTE3OX0.vq8UFeCbw5Ca5Usb3r4tjSrSFpjL4J4pya26GVshtj8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseLogin() {
  console.log('🔍 Diagnosing admin login issue...\n');
  
  const adminEmail = 'admin@seaircon.com';
  const adminPassword = 'admin123!';
  
  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    const { data: employees, error: dbError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);
    
    if (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      return;
    }
    console.log('✅ Database connected successfully');
    
    // 2. Check if employee record exists
    console.log('\n2️⃣ Checking employee record...');
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (empError) {
      console.log('❌ Employee record not found or error:', empError.message);
      console.log('💡 Need to create employee record first');
    } else {
      console.log('✅ Employee record found:');
      console.log('   Name:', employee.full_name);
      console.log('   Role:', employee.role);
      console.log('   Active:', employee.is_active);
    }
    
    // 3. Test login
    console.log('\n3️⃣ Testing login credentials...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('\n💡 Possible solutions:');
        console.log('   1. Create the auth user in Supabase Auth dashboard');
        console.log('   2. Use the correct password');
        console.log('   3. Check if email confirmation is required');
        console.log('   4. Try a different email/password combination');
      }
    } else {
      console.log('✅ Login successful!');
      console.log('   User ID:', loginData.user?.id);
      console.log('   Email:', loginData.user?.email);
      
      // Sign out after test
      await supabase.auth.signOut();
      console.log('✅ Signed out successfully');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to Authentication > Users');
  console.log('3. Create a new user with:');
  console.log('   - Email: admin@seaircon.com');
  console.log('   - Password: admin123!');
  console.log('4. Confirm the email');
  console.log('5. Try logging in again');
}

diagnoseLogin();
