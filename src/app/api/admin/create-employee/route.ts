import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, fullName, role, department, phone, password } = body

    // Validate required fields
    if (!email || !fullName || !role || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

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
        { error: 'Only administrators can create employees' },
        { status: 403 }
      )
    }

    // Check if employee already exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('email')
      .eq('email', email)
      .single()

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 409 }
      )
    }

    // Create Supabase Auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        role: role
      }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 500 }
      )
    }

    // Create employee record
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert([{
        email,
        full_name: fullName,
        role,
        department: department || null,
        phone: phone || null,
        is_active: true
      }])
      .select()
      .single()

    if (employeeError) {
      console.error('Employee creation error:', employeeError)
      
      // Clean up auth user if employee creation fails
      if (authUser.user) {
        await supabase.auth.admin.deleteUser(authUser.user.id)
      }
      
      return NextResponse.json(
        { error: `Failed to create employee record: ${employeeError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      employee,
      authUser: {
        id: authUser.user?.id,
        email: authUser.user?.email
      }
    })

  } catch (error) {
    console.error('Employee creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
