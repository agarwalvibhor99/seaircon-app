import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, fullName, role, department, phone, isActive } = body

    // Validate required fields
    if (!id || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    // Verify the requesting user is an admin
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: requestingEmployee } = await supabase
      .from('employees')
      .select('role')
      .eq('email', session.user.email)
      .single()

    if (requestingEmployee?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can update employees' },
        { status: 403 }
      )
    }

    // Update employee record
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .update({
        full_name: fullName,
        role,
        department: department || null,
        phone: phone || null,
        is_active: isActive
      })
      .eq('id', id)
      .select()
      .single()

    if (employeeError) {
      console.error('Employee update error:', employeeError)
      return NextResponse.json(
        { error: `Failed to update employee: ${employeeError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      employee
    })

  } catch (error) {
    console.error('Employee update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
