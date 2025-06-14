import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/quotations/[id]/approve
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get employee ID
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('email', user.user.email)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Update quotation status to approved
    const { data: quotation, error } = await supabase
      .from('quotations')
      .update({
        status: 'approved',
        approved_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Log project activity
    if (quotation.project_id) {
      await supabase
        .from('project_activities')
        .insert([{
          project_id: quotation.project_id,
          activity_type: 'quote_approved',
          title: `Quotation ${quotation.quote_number} approved`,
          description: `Quotation for ₹${quotation.total_amount.toLocaleString('en-IN')} has been approved`,
          entity_type: 'quotation',
          entity_id: quotation.id,
          performed_by: employee.id
        }])
    }

    return NextResponse.json({ data: quotation })
  } catch (error) {
    console.error('Error approving quotation:', error)
    return NextResponse.json(
      { error: 'Failed to approve quotation' },
      { status: 500 }
    )
  }
}
