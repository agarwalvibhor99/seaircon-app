import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
        },
      }
    )
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get employee info
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const invoiceId = searchParams.get('invoice_id')
    const quoteId = searchParams.get('quote_id')
    const customerId = searchParams.get('customer_id')

    // Build query with enhanced relationships
    let query = supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(
          id,
          invoice_number,
          total_amount,
          customer:customers(name, phone, email)
        ),
        project:projects(
          id,
          project_number,
          project_name,
          customer:customers(name, phone, email)
        ),
        quotation:quotations(
          id,
          quote_number,
          total_amount,
          customer:customers(name, phone, email)
        ),
        customer:customers(name, phone, email),
        recorded_by_employee:employees!recorded_by(full_name)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (projectId) query = query.eq('project_id', projectId)
    if (invoiceId) query = query.eq('invoice_id', invoiceId)
    if (quoteId) query = query.eq('quote_id', quoteId)
    if (customerId) query = query.eq('customer_id', customerId)

    const { data: payments, error } = await query

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    return NextResponse.json({ payments })

  } catch (error) {
    console.error('Payments API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  )
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get employee info
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const body = await request.json()
    
    // Validate required fields
    const { 
      payment_reference, 
      invoice_id, 
      amount, 
      payment_date, 
      payment_method,
      transaction_id,
      receipt_number,
      notes
    } = body

    if (!payment_reference || !amount || !payment_date || !payment_method) {
      return NextResponse.json({ 
        error: 'Missing required fields: payment_reference, amount, payment_date, payment_method' 
      }, { status: 400 })
    }

    // Start transaction
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        payment_reference,
        invoice_id: invoice_id || null,
        amount: parseFloat(amount),
        payment_date,
        payment_method,
        transaction_id: transaction_id || null,
        receipt_number: receipt_number || null,
        notes: notes || null,
        recorded_by: employee.id,
        status: 'completed'
      }])
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment:', paymentError)
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }

    // If payment is against an invoice, update the invoice
    if (invoice_id) {
      // Get current invoice data
      const { data: invoice, error: invoiceSelectError } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid')
        .eq('id', invoice_id)
        .single()

      if (invoiceSelectError) {
        console.error('Error fetching invoice:', invoiceSelectError)
        return NextResponse.json({ error: 'Failed to fetch invoice data' }, { status: 500 })
      }

      // Calculate new amounts
      const newAmountPaid = (invoice.amount_paid || 0) + parseFloat(amount)
      const newBalanceDue = invoice.total_amount - newAmountPaid

      // Determine new status
      let newStatus = 'pending'
      if (newBalanceDue <= 0) {
        newStatus = 'paid'
      } else if (newAmountPaid > 0) {
        newStatus = 'partially_paid'
      }

      // Update invoice
      const { error: invoiceUpdateError } = await supabase
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          balance_due: newBalanceDue,
          status: newStatus,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null
        })
        .eq('id', invoice_id)

      if (invoiceUpdateError) {
        console.error('Error updating invoice:', invoiceUpdateError)
        // Note: Payment was created successfully, but invoice update failed
        // In a production system, you might want to implement compensation logic
      }
    }

    return NextResponse.json({ 
      message: 'Payment recorded successfully',
      payment 
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
        },
      }
    )
    const body = await req.json()
    const { id, ...updateData } = body

    // Get current user for authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const paymentUpdateData = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .update(paymentUpdateData)
      .eq('id', id)
      .select(`
        *,
        invoices(
          invoice_number,
          total_amount,
          customers(name, phone, email)
        ),
        recorded_by:employees!payments_recorded_by_fkey(full_name)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Payment updated successfully'
    })

  } catch (error: any) {
    console.error('Update payment error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
        },
      }
    )
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Get current user for authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete payment error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
