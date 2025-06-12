import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get workflow notifications
    const notifications = await getWorkflowNotifications(supabase, userId)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { type, title, message, data, user_id } = await request.json()

    // Create notification
    const { data: notification, error } = await supabase
      .from('workflow_notifications')
      .insert([{
        type,
        title,
        message,
        data,
        user_id,
        read: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Notification creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const { read } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    // Update notification status
    const { error } = await supabase
      .from('workflow_notifications')
      .update({ read })
      .eq('id', notificationId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

async function getWorkflowNotifications(supabase: any, userId: string) {
  const notifications = []

  // Check for recently approved quotations
  const { data: approvedQuotations } = await supabase
    .from('quotations')
    .select('*')
    .eq('status', 'approved')
    .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

  if (approvedQuotations) {
    for (const quotation of approvedQuotations) {
      // Check if project already exists for this quotation
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('quotation_id', quotation.id)
        .single()

      if (!existingProject) {
        notifications.push({
          id: `quotation_approved_${quotation.id}`,
          type: 'quotation_approved',
          title: 'Quotation Approved',
          message: `Quotation ${quotation.quotation_number} for ${quotation.client_name} has been approved and is ready for project creation.`,
          data: {
            quotation_id: quotation.id,
            quotation_number: quotation.quotation_number,
            client_name: quotation.client_name
          },
          created_at: quotation.updated_at,
          read: false
        })
      }
    }
  }

  // Check for overdue projects
  const { data: overdueProjects } = await supabase
    .from('projects')
    .select('*')
    .lt('estimated_completion', new Date().toISOString())
    .not('status', 'eq', 'completed')
    .not('status', 'eq', 'cancelled')

  if (overdueProjects) {
    for (const project of overdueProjects) {
      notifications.push({
        id: `project_overdue_${project.id}`,
        type: 'project_overdue',
        title: 'Project Overdue',
        message: `Project "${project.project_name}" is overdue and needs attention.`,
        data: {
          project_id: project.id,
          project_name: project.project_name
        },
        created_at: project.estimated_completion,
        read: false
      })
    }
  }

  // Check for pending payments
  const { data: pendingInvoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('status', 'pending')
    .lt('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) // Due within 7 days

  if (pendingInvoices) {
    for (const invoice of pendingInvoices) {
      notifications.push({
        id: `payment_due_${invoice.id}`,
        type: 'payment_due',
        title: 'Payment Due Soon',
        message: `Invoice ${invoice.invoice_number} is due soon and requires follow-up.`,
        data: {
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number
        },
        created_at: invoice.created_at,
        read: false
      })
    }
  }

  return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}
