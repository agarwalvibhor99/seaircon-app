const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('Testing Supabase connection...');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('consultation_requests').select('count').limit(1);
    
    if (error) {
      console.log('❌ Database error:', error);
    } else {
      console.log('✅ Database connection successful!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.log('❌ Connection failed:', err);
  }
}

testConnection();
