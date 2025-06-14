import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/quotations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const customerId = searchParams.get('customer_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('quotations')
      .select(`
        *,
        customer:customers(*),
        project:projects(*),
        created_by_employee:employees!created_by(*),
        quote_items:quotation_items(*)
      `)
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    if (customerId) {
      query = query.eq('customer_id', customerId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching quotations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotations' },
      { status: 500 }
    )
  }
}

// POST /api/quotations - Create new quotation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quotation, items } = body

    // Start transaction
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

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unit_price), 0
    )
    const discountAmount = (subtotal * (quotation.discount_percentage || 0)) / 100
    const taxableAmount = subtotal - discountAmount
    const taxAmount = (taxableAmount * (quotation.tax_rate || 18)) / 100
    const totalAmount = taxableAmount + taxAmount

    // Create quotation
    const quotationData = {
      ...quotation,
      created_by: employee.id,
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      issue_date: new Date().toISOString().split('T')[0]
    }

    const { data: newQuotation, error: quotationError } = await supabase
      .from('quotations')
      .insert([quotationData])
      .select()
      .single()

    if (quotationError) throw quotationError

    // Create quotation items
    const quotationItems = items.map((item: any) => ({
      quotation_id: newQuotation.id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || 'piece',
      unit_price: item.unit_price,
      total_amount: item.quantity * item.unit_price,
      category: item.category,
      notes: item.notes
    }))

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(quotationItems)

    if (itemsError) throw itemsError

    // Log project activity if linked to project
    if (quotation.project_id) {
      await supabase
        .from('project_activities')
        .insert([{
          project_id: quotation.project_id,
          activity_type: 'quote_created',
          title: `Quotation ${newQuotation.quote_number} created`,
          description: `Quotation for ₹${totalAmount.toLocaleString('en-IN')} has been created`,
          entity_type: 'quotation',
          entity_id: newQuotation.id,
          performed_by: employee.id
        }])
    }

    return NextResponse.json({ data: newQuotation })
  } catch (error) {
    console.error('Error creating quotation:', error)
    return NextResponse.json(
      { error: 'Failed to create quotation' },
      { status: 500 }
    )
  }
}
