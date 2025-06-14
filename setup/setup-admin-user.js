#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auvgmprjwtyurxswsvwg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dmdtcHJqd3R5dXJ4c3dzdndnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQxMzE3OSwiZXhwIjoyMDYzOTg5MTc5fQ.A3JGtXCX5Rv7Yc60wK8jIyCim6D6--q0PGiOCUQYJxg';

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdminUser() {
  console.log('🔧 Setting up admin user for SE Aircon CRM...\n');
  
  const adminEmail = 'admin@seaircon.com';
  const adminPassword = 'admin123!';
  
  try {
    // 1. Check if employee record exists
    console.log('📋 Checking employee record...');
    const { data: existingEmployee, error: employeeCheckError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (employeeCheckError && employeeCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking employee:', employeeCheckError.message);
      return;
    }
    
    // 2. Create or update employee record
    if (!existingEmployee) {
      console.log('👤 Creating employee record...');
      const { data: newEmployee, error: createEmployeeError } = await supabase
        .from('employees')
        .insert([{
          email: adminEmail,
          full_name: 'System Administrator',
          role: 'admin',
          department: 'management',
          phone: '+91 9311885464',
          is_active: true
        }])
        .select()
        .single();
      
      if (createEmployeeError) {
        console.error('❌ Error creating employee:', createEmployeeError.message);
        return;
      }
      
      console.log('✅ Employee record created:', newEmployee.full_name);
    } else {
      console.log('✅ Employee record exists:', existingEmployee.full_name);
      
      // Update to ensure it's active
      await supabase
        .from('employees')
        .update({ is_active: true })
        .eq('email', adminEmail);
    }
    
    // 3. Create auth user
    console.log('🔐 Creating/updating auth user...');
    
    // First, try to get existing user
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users?.find(user => user.email === adminEmail);
    
    if (existingUser) {
      console.log('🔄 Auth user exists, updating password...');
      
      // Update existing user password
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { 
          password: adminPassword,
          email_confirm: true
        }
      );
      
      if (updateError) {
        console.error('❌ Error updating user:', updateError.message);
        return;
      }
      
      console.log('✅ Auth user password updated');
    } else {
      console.log('👤 Creating new auth user...');
      
      // Create new auth user
      const { data: newUser, error: createAuthError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'System Administrator'
        }
      });
      
      if (createAuthError) {
        console.error('❌ Error creating auth user:', createAuthError.message);
        
        // If user already exists error, try to sign in to check
        if (createAuthError.message.includes('already exists')) {
          console.log('🔍 User might exist, trying password reset...');
          
          // Reset password approach
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(adminEmail);
          if (resetError) {
            console.error('❌ Reset password error:', resetError.message);
          } else {
            console.log('📧 Password reset email sent (if user exists)');
          }
        }
        return;
      }
      
      console.log('✅ Auth user created:', newUser.user?.email);
    }
    
    // 4. Test login
    console.log('\n🧪 Testing login credentials...');
    
    // Create a client instance for testing
    const testClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dmdtcHJqd3R5dXJ4c3dzdndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MTMxNzksImV4cCI6MjA2Mzk4OTE3OX0.vq8UFeCbw5Ca5Usb3r4tjSrSFpjL4J4pya26GVshtj8');
    
    const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
      
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('💡 This might be because:');
        console.log('   1. Email confirmation is required');
        console.log('   2. User was created but password not set correctly');
        console.log('   3. User exists with different password');
      }
    } else {
      console.log('✅ Login test successful!');
      
      // Check employee authorization
      const { data: employee, error: empError } = await testClient
        .from('employees')
        .select('*')
        .eq('email', adminEmail)
        .single();
      
      if (empError) {
        console.error('❌ Employee authorization check failed:', empError.message);
      } else {
        console.log('✅ Employee authorization successful:', employee.full_name);
      }
      
      // Sign out
      await testClient.auth.signOut();
    }
    
    console.log('\n🎯 Setup complete!');
    console.log('📧 Email: admin@seaircon.com');
    console.log('🔑 Password: admin123!');
    console.log('🌐 Login URL: http://localhost:3000/admin/login');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

setupAdminUser();
