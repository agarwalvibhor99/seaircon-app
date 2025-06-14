#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auvgmprjwtyurxswsvwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dmdtcHJqd3R5dXJ4c3dzdndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MTMxNzksImV4cCI6MjA2Mzk4OTE3OX0.vq8UFeCbw5Ca5Usb3r4tjSrSFpjL4J4pya26GVshtj8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminSetup() {
  console.log('🔧 Testing Supabase connection...');
  
  // Check employees table
  const { data: employees, error: employeesError } = await supabase
    .from('employees')
    .select('*');
    
  if (employeesError) {
    console.error('❌ Error accessing employees table:', employeesError.message);
    return;
  }
  
  console.log('✅ Connected to Supabase successfully');
  console.log(`📊 Found ${employees.length} employees in database`);
  
  if (employees.length === 0) {
    console.log('🔑 Creating admin employee for testing...');
    
    // Create admin employee
    const { data: newEmployee, error: createError } = await supabase
      .from('employees')
      .insert([
        {
          email: 'admin@seaircon.com',
          full_name: 'System Administrator',
          role: 'admin',
          department: 'management',
          is_active: true
        }
      ])
      .select()
      .single();
      
    if (createError) {
      console.error('❌ Error creating admin employee:', createError.message);
      return;
    }
    
    console.log('✅ Admin employee created:', newEmployee);
    
    // Now create auth user
    console.log('🔐 Creating auth user...');
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: 'admin@seaircon.com',
      password: 'admin123!'
    });
    
    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
    } else {
      console.log('✅ Auth user created successfully');
    }
  } else {
    console.log('👥 Existing employees:');
    employees.forEach((emp, index) => {
      console.log(`  ${index + 1}. ${emp.full_name} (${emp.email}) - ${emp.role} - Active: ${emp.is_active}`);
    });
  }
  
  console.log('\n🎯 Admin login test credentials:');
  console.log('   Email: admin@seaircon.com');
  console.log('   Password: admin123!');
  console.log('\n🌐 Try accessing: http://localhost:3000/admin/login');
}

testAdminSetup().catch(console.error);
