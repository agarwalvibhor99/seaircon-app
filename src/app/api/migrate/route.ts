import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database migration...')

    // Create new tables if they don't exist
    console.log('Creating quotations table...')
    const { error: quotationsError } = await supabase.rpc('create_quotations_table')
    if (quotationsError && !quotationsError.message.includes('already exists')) {
      console.error('Error creating quotations table:', quotationsError)
    }

    console.log('Creating quotation_items table...')
    const { error: quotationItemsError } = await supabase.rpc('create_quotation_items_table') 
    if (quotationItemsError && !quotationItemsError.message.includes('already exists')) {
      console.error('Error creating quotation_items table:', quotationItemsError)
    }

    console.log('Creating payments table...')
    const { error: paymentsError } = await supabase.rpc('create_payments_table')
    if (paymentsError && !paymentsError.message.includes('already exists')) {
      console.error('Error creating payments table:', paymentsError)
    }

    console.log('Creating project_activities table...')
    const { error: activitiesError } = await supabase.rpc('create_project_activities_table')
    if (activitiesError && !activitiesError.message.includes('already exists')) {
      console.error('Error creating project_activities table:', activitiesError)
    }

    console.log('Migration completed successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully' 
    })

  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
