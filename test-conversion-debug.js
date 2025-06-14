const { createClient } = require('@supabase/supabase-js')

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConversionDebug() {
  console.log('🔍 Testing conversion debug...')
  
  try {
    // Test 1: Check if we can query consultation_requests
    console.log('\n📋 Test 1: Querying consultation_requests...')
    const { data: leads, error: leadsError } = await supabase
      .from('consultation_requests')
      .select('id, name, email, status')
      .limit(1)
    
    if (leadsError) {
      console.error('❌ Error querying leads:', leadsError)
    } else {
      console.log('✅ Leads query successful, sample:', leads?.[0])
    }
    
    // Test 2: Try to create a lead with 'converted' status
    console.log('\n📋 Test 2: Testing converted status...')
    const testLead = {
      name: 'Test Conversion Debug',
      email: 'test-debug@example.com',
      phone: '1234567890',
      service_type: 'consultation',
      message: 'Test message for conversion debug',
      status: 'converted'
    }
    
    const { data: newLead, error: createError } = await supabase
      .from('consultation_requests')
      .insert(testLead)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Error creating lead with converted status:', createError)
      console.log('💡 This confirms the migration needs to be run!')
    } else {
      console.log('✅ Lead with converted status created:', newLead.id)
      
      // Clean up the test lead
      await supabase
        .from('consultation_requests')
        .delete()
        .eq('id', newLead.id)
      console.log('🧹 Test lead cleaned up')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testConversionDebug()
