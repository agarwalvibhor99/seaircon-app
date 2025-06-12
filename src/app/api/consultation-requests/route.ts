import { NextRequest, NextResponse } from 'next/server'
import { CRMService } from '@/lib/crm-service'
import { verifyToken } from '@/lib/auth.service'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication for admin routes
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const search = searchParams.get('search')

    const filters = {
      ...(status && { status }),
      ...(limit && { limit: parseInt(limit) }),
      ...(offset && { offset: parseInt(offset) }),
      ...(search && { search })
    }

    const requests = await CRMService.consultationRequests.getAll(filters)
    
    return NextResponse.json({
      success: true,
      data: requests,
      count: requests.length
    })
  } catch (error) {
    console.error('GET /api/consultation-requests error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consultation requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['full_name', 'email', 'phone', 'service_type', 'message']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Add default values and clean data
    const consultationData = {
      full_name: data.full_name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      company: data.company?.trim() || null,
      service_type: data.service_type,
      message: data.message.trim(),
      urgency: data.urgency || 'medium',
      status: 'new',
      priority: data.priority || 'medium',
      property_type: data.property_type || null,
      project_size: data.project_size || null,
      budget_range: data.budget_range || null,
      preferred_contact_method: data.preferred_contact_method || 'email',
      source: 'website',
      notes: data.notes?.trim() || null
    }

    const result = await CRMService.consultationRequests.create(consultationData)
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Consultation request created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/consultation-requests error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create consultation request' },
      { status: 500 }
    )
  }
}
