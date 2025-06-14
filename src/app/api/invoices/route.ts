import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
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
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    let query = supabase
      .from('invoices')
      .select(`
        *,
        projects(project_name, project_number, customers(name, email, phone)),
        customers(name, email, phone),
        created_by:employees!invoices_created_by_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: invoices, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Fetch invoices error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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

    // Get current user for created_by field
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get employee details
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Generate invoice number if not provided
    const invoiceNumber = body.invoice_number || `INV-${Date.now()}`

    const invoiceData = {
      ...body,
      invoice_number: invoiceNumber,
      created_by: employee.id,
      issue_date: body.issue_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select(`
        *,
        projects(project_name, project_number, customers(name, email, phone)),
        customers(name, email, phone),
        created_by:employees!invoices_created_by_fkey(full_name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    })

  } catch (error: any) {
    console.error('Create invoice error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const invoiceUpdateData = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(invoiceUpdateData)
      .eq('id', id)
      .select(`
        *,
        projects(project_name, project_number, customers(name, email, phone)),
        customers(name, email, phone),
        created_by:employees!invoices_created_by_fkey(full_name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice updated successfully'
    })

  } catch (error: any) {
    console.error('Update invoice error:', error)
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
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Get current user for authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete invoice error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
