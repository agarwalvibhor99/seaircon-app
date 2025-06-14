import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/quotations/[id]/convert-to-invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { invoiceType = 'invoice', invoiceItems = [] } = body

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

    // Get quotation details
    const { data: quotation, error: quoteError } = await supabase
      .from('quotations')
      .select(`
        *,
        quote_items:quotation_items(*)
      `)
      .eq('id', params.id)
      .single()

    if (quoteError) throw quoteError

    if (quotation.status !== 'approved') {
      return NextResponse.json(
        { error: 'Only approved quotations can be converted to invoices' },
        { status: 400 }
      )
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`

    // Create invoice from quotation
    const invoiceData = {
      invoice_number: invoiceNumber,
      invoice_type: invoiceType,
      quote_id: quotation.id,
      quote_version: quotation.version,
      project_id: quotation.project_id,
      customer_id: quotation.customer_id,
      created_by: employee.id,
      status: 'draft',
      subtotal: quotation.subtotal,
      tax_rate: quotation.tax_rate,
      tax_amount: quotation.tax_amount,
      discount_percentage: quotation.discount_percentage,
      discount_amount: quotation.discount_amount,
      total_amount: quotation.total_amount,
      amount_paid: 0,
      balance_due: quotation.total_amount,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      payment_terms: 'Net 30 days'
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create invoice items from quotation items or custom items
    const itemsToCreate = invoiceItems.length > 0 ? invoiceItems : quotation.quote_items

    const invoiceItemsData = itemsToCreate.map((item: any) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || 'piece',
      unit_price: item.unit_price,
      total_amount: item.quantity * item.unit_price,
      category: item.category,
      notes: item.notes
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItemsData)

    if (itemsError) throw itemsError

    // Log project activity
    if (quotation.project_id) {
      await supabase
        .from('project_activities')
        .insert([{
          project_id: quotation.project_id,
          activity_type: 'invoice_created',
          title: `Invoice ${invoice.invoice_number} created from quotation`,
          description: `Invoice for ₹${invoice.total_amount.toLocaleString('en-IN')} created from approved quotation ${quotation.quote_number}`,
          entity_type: 'invoice',
          entity_id: invoice.id,
          performed_by: employee.id,
          metadata: {
            source_quotation_id: quotation.id,
            source_quotation_number: quotation.quote_number
          }
        }])
    }

    return NextResponse.json({ data: invoice })
  } catch (error) {
    console.error('Error converting quotation to invoice:', error)
    return NextResponse.json(
      { error: 'Failed to convert quotation to invoice' },
      { status: 500 }
    )
  }
}
