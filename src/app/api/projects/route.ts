import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    let query = supabase
      .from('projects')
      .select(`
        *,
        customers(name, email, phone),
        quotations(quotation_number, total_amount),
        project_manager:employees!project_manager_id(full_name, email),
        assigned_team:employees!assigned_team_id(full_name, email)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.or(`project_name.ilike.%${search}%,project_number.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: projects, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Fetch projects error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
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

    // Generate project number
    const projectNumber = `PROJ-${Date.now()}`

    const projectData = {
      ...body,
      project_number: projectNumber,
      created_by: employee.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select(`
        *,
        customers(name, email, phone),
        quotations(quotation_number, total_amount),
        project_manager:employees!project_manager_id(full_name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully'
    })

  } catch (error: any) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
