#!/usr/bin/env node

// Test Employee Management System
// Run this script to verify the employee management functionality

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Required variables:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testEmployeeManagement() {
  console.log('🧪 Testing Employee Management System...\n')
  
  try {
    // 1. Test database connection
    console.log('1️⃣  Testing database connection...')
    const { data: employees, error: dbError } = await supabase
      .from('employees')
      .select('*')
      .limit(1)
    
    if (dbError) {
      console.error('❌ Database connection failed:', dbError.message)
      return
    }
    console.log('✅ Database connection successful')
    
    // 2. Check if admin user exists
    console.log('\n2️⃣  Checking admin user...')
    const { data: adminUser, error: adminError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', 'admin@seaircon.com')
      .single()
    
    if (adminError) {
      console.log('⚠️  Admin user not found. Creating admin user...')
      
      // Create admin employee
      const { data: newAdmin, error: createError } = await supabase
        .from('employees')
        .insert([{
          email: 'admin@seaircon.com',
          full_name: 'System Administrator',
          role: 'admin',
          department: 'management',
          phone: '+91 9311885464',
          is_active: true
        }])
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Failed to create admin employee:', createError.message)
        return
      }
      
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@seaircon.com',
        password: 'admin123!',
        email_confirm: true,
        user_metadata: {
          full_name: 'System Administrator',
          role: 'admin'
        }
      })
      
      if (authError) {
        console.error('❌ Failed to create auth user:', authError.message)
        return
      }
      
      console.log('✅ Admin user created successfully')
    } else {
      console.log('✅ Admin user exists:', adminUser.full_name)
    }
    
    // 3. Test employee creation functionality
    console.log('\n3️⃣  Testing employee creation...')
    const testEmail = `test-${Date.now()}@seaircon.com`
    
    // Create test employee via API simulation
    const { data: testEmployee, error: testError } = await supabase
      .from('employees')
      .insert([{
        email: testEmail,
        full_name: 'Test Employee',
        role: 'employee',
        department: 'technical',
        phone: '+91 9876543210',
        is_active: true
      }])
      .select()
      .single()
    
    if (testError) {
      console.error('❌ Failed to create test employee:', testError.message)
      return
    }
    
    console.log('✅ Test employee created:', testEmployee.full_name)
    
    // 4. Test employee update
    console.log('\n4️⃣  Testing employee update...')
    const { data: updatedEmployee, error: updateError } = await supabase
      .from('employees')
      .update({ 
        full_name: 'Test Employee Updated',
        department: 'sales'
      })
      .eq('id', testEmployee.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Failed to update employee:', updateError.message)
      return
    }
    
    console.log('✅ Employee updated successfully:', updatedEmployee.full_name)
    
    // 5. Test employee deactivation
    console.log('\n5️⃣  Testing employee deactivation...')
    const { data: deactivatedEmployee, error: deactivateError } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', testEmployee.id)
      .select()
      .single()
    
    if (deactivateError) {
      console.error('❌ Failed to deactivate employee:', deactivateError.message)
      return
    }
    
    console.log('✅ Employee deactivated successfully')
    
    // 6. Clean up test employee
    console.log('\n6️⃣  Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', testEmployee.id)
    
    if (deleteError) {
      console.log('⚠️  Failed to clean up test employee:', deleteError.message)
    } else {
      console.log('✅ Test data cleaned up')
    }
    
    // 7. Display summary
    console.log('\n📊 Employee Management System Status:')
    console.log('='.repeat(50))
    
    const { data: allEmployees, error: countError } = await supabase
      .from('employees')
      .select('role, is_active, department')
    
    if (!countError && allEmployees) {
      console.log(`👥 Total Employees: ${allEmployees.length}`)
      console.log(`🟢 Active: ${allEmployees.filter(e => e.is_active).length}`)
      console.log(`🔴 Inactive: ${allEmployees.filter(e => !e.is_active).length}`)
      console.log(`🛡️  Admins: ${allEmployees.filter(e => e.role === 'admin').length}`)
      console.log(`👔 Managers: ${allEmployees.filter(e => e.role === 'manager').length}`)
      console.log(`👷 Technicians: ${allEmployees.filter(e => e.role === 'technician').length}`)
      
      const departments = [...new Set(allEmployees.filter(e => e.department).map(e => e.department))]
      console.log(`🏢 Departments: ${departments.join(', ')}`)
    }
    
    console.log('\n🎉 Employee Management System test completed successfully!')
    console.log('\n🚀 Next Steps:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Login as admin: admin@seaircon.com / admin123!')
    console.log('3. Navigate to: http://localhost:3000/admin/employees')
    console.log('4. Test the employee management interface')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testEmployeeManagement().catch(console.error)
