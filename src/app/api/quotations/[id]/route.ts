import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/quotations/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .select(`
        *,
        customer:customers(*),
        project:projects(*),
        created_by_employee:employees!created_by(*),
        quote_items:quotation_items(*)
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching quotation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotation' },
      { status: 500 }
    )
  }
}

// PUT /api/quotations/[id] - Update quotation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { quotation, items } = body

    // Get current user
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

    // Update quotation
    const quotationData = {
      ...quotation,
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount
    }

    const { data: updatedQuotation, error: quotationError } = await supabase
      .from('quotations')
      .update(quotationData)
      .eq('id', params.id)
      .select()
      .single()

    if (quotationError) throw quotationError

    // Delete existing items and recreate
    await supabase
      .from('quotation_items')
      .delete()
      .eq('quotation_id', params.id)

    // Create new quotation items
    const quotationItems = items.map((item: any) => ({
      quotation_id: params.id,
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

    // Log project activity
    if (updatedQuotation.project_id) {
      await supabase
        .from('project_activities')
        .insert([{
          project_id: updatedQuotation.project_id,
          activity_type: 'quote_updated',
          title: `Quotation ${updatedQuotation.quote_number} updated`,
          description: `Quotation total updated to ₹${totalAmount.toLocaleString('en-IN')}`,
          entity_type: 'quotation',
          entity_id: updatedQuotation.id,
          performed_by: employee.id
        }])
    }

    return NextResponse.json({ data: updatedQuotation })
  } catch (error) {
    console.error('Error updating quotation:', error)
    return NextResponse.json(
      { error: 'Failed to update quotation' },
      { status: 500 }
    )
  }
}

// DELETE /api/quotations/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get quotation details for activity logging
    const { data: quotation } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', params.id)
      .single()

    // Delete quotation (items will be cascade deleted)
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    // Log project activity if linked to project
    if (quotation?.project_id) {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('email', user.user.email)
        .single()

      if (employee) {
        await supabase
          .from('project_activities')
          .insert([{
            project_id: quotation.project_id,
            activity_type: 'quote_deleted',
            title: `Quotation ${quotation.quote_number} deleted`,
            description: `Quotation has been removed from the system`,
            entity_type: 'quotation',
            entity_id: quotation.id,
            performed_by: employee.id
          }])
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quotation:', error)
    return NextResponse.json(
      { error: 'Failed to delete quotation' },
      { status: 500 }
    )
  }
}
