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

    const filters: any = {
      ...(limit && { limit: parseInt(limit) }),
      ...(offset && { offset: parseInt(offset) }),
      ...(search && { search })
    }

    // Only apply specific status filters if requested, otherwise return all leads
    if (status && status !== 'all') {
      if (status === 'active') {
        // For backwards compatibility - exclude converted, completed, cancelled
        filters.excludeStatuses = ['converted', 'completed', 'cancelled']
      } else {
        filters.status = status as 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled' | 'converted'
      }
    }

    const result = await CRMService.consultationRequests.getAll(filters)
    
    if (result.error) {
      throw result.error
    }
    
    return NextResponse.json({
      success: true,
      data: result.data || [],
      count: Array.isArray(result.data) ? result.data.length : 0
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
    const requiredFields = ['name', 'email', 'phone', 'service_type', 'message']
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
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      company: data.company?.trim() || null,
      service_type: data.service_type,
      message: data.message.trim(),
      urgency_level: data.urgency_level || 'medium',
      status: 'new' as const,
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

export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 DELETE API called for consultation-requests')
    
    // Verify authentication for admin routes
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      console.log('❌ Authentication failed in DELETE API')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ Authentication successful in DELETE API, user:', authResult.user?.email)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('🔍 Lead ID to delete:', id)

    if (!id) {
      console.log('❌ No ID provided in DELETE API')
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    console.log('🗑️ Calling CRMService.consultationRequests.delete with ID:', id)
    const result = await CRMService.consultationRequests.delete(id)
    console.log('🔍 Delete result from CRMService:', result)
    
    if (result.error) {
      console.error('❌ CRMService delete failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error.message || 'Failed to delete lead' },
        { status: 500 }
      )
    }
    
    console.log('✅ Lead deleted successfully via CRMService')
    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Lead deleted successfully'
    })
  } catch (error) {
    console.error('💥 DELETE /api/consultation-requests error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('🔍 PATCH API called for consultation-requests')
    
    // Verify authentication for admin routes
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      console.log('❌ Authentication failed in PATCH API')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ Authentication successful in PATCH API, user:', authResult.user?.email)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('🔍 Lead ID to update:', id)

    if (!id) {
      console.log('❌ No ID provided in PATCH API')
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    const updateData = await request.json()
    console.log('🔍 Update data:', updateData)

    console.log('🔄 Calling CRMService.consultationRequests.update with ID:', id, 'data:', updateData)
    const result = await CRMService.consultationRequests.update(id, updateData)
    console.log('🔍 Update result from CRMService:', result)
    
    if (result.error) {
      console.error('❌ CRMService update failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error.message || 'Failed to update lead' },
        { status: 500 }
      )
    }
    
    console.log('✅ Lead updated successfully via CRMService')
    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Lead updated successfully'
    })
  } catch (error) {
    console.error('💥 PATCH /api/consultation-requests error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}
