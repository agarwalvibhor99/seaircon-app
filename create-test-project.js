#!/usr/bin/env node

// Script to create a test project
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🚀 Creating test project...')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestProject() {
  try {
    // First, check if we have any customers
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .limit(1)

    if (customerError) {
      console.error('❌ Error fetching customers:', customerError)
      return
    }

    let customerId
    if (customers && customers.length > 0) {
      customerId = customers[0].id
      console.log('✅ Using existing customer:', customers[0].name)
    } else {
      // Create a test customer
      const { data: newCustomer, error: newCustomerError } = await supabase
        .from('customers')
        .insert([{
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+91-9999999999',
          address: 'Test Address, Test City',
          customer_type: 'individual',
          is_active: true
        }])
        .select('id')
        .single()

      if (newCustomerError) {
        console.error('❌ Error creating customer:', newCustomerError)
        return
      }

      customerId = newCustomer.id
      console.log('✅ Created test customer')
    }

    // Create a test project
    const testProject = {
      project_name: 'Test AC Installation',
      project_number: `PROJ-${Date.now()}`,
      customer_id: customerId,
      project_type: 'installation',
      priority: 'medium',
      status: 'planning',
      project_value: 50000,
      site_address: 'Test Site Address, Test City',
      description: 'Test project for debugging',
      notes: 'Created by test script'
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([testProject])
      .select('*')
      .single()

    if (projectError) {
      console.error('❌ Error creating project:', projectError)
    } else {
      console.log('✅ Test project created successfully!')
      console.log('📋 Project details:', {
        id: project.id,
        name: project.project_name,
        number: project.project_number,
        status: project.status
      })
    }

    // Verify we can read it back
    const { data: readBack, error: readError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project.id)
      .single()

    if (readError) {
      console.error('❌ Error reading back project:', readError)
    } else {
      console.log('✅ Successfully read back project:', readBack.project_name)
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

createTestProject()
