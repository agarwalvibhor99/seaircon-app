import { NextRequest, NextResponse } from 'next/server'
import { CRMService } from '@/lib/crm-service'
import { verifyToken } from '@/lib/auth.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await CRMService.consultationRequests.getById(params.id)
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Consultation request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('GET /api/consultation-requests/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consultation request' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const result = await CRMService.consultationRequests.update(params.id, data)
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Consultation request updated successfully'
    })
  } catch (error) {
    console.error('PUT /api/consultation-requests/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update consultation request' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await CRMService.consultationRequests.delete(params.id)
    
    return NextResponse.json({
      success: true,
      message: 'Consultation request deleted successfully'
    })
  } catch (error) {
    console.error('DELETE /api/consultation-requests/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete consultation request' },
      { status: 500 }
    )
  }
}
