import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
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

    // Fetch payments with related data
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoices(
          invoice_number,
          total_amount,
          customers(name, phone, email)
        ),
        recorded_by:employees!payments_recorded_by_fkey(full_name)
      `)
      .order('created_at', { ascending: false })

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
    const supabase = createRouteHandlerClient({ cookies })
    
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
