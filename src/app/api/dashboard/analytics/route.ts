import { NextRequest, NextResponse } from 'next/server'
import { CRMService } from '@/lib/crm-service'
import { verifyToken } from '@/lib/auth.service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stats = await CRMService.analytics.getDashboardStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('GET /api/dashboard/analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
