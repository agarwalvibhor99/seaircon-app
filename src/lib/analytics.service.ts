import { supabase } from './supabase'
import { DashboardStats, ConsultationRequest, ServiceResponse } from './types'

export class AnalyticsService {
  static async getDashboardStats(): Promise<ServiceResponse<DashboardStats>> {
    try {
      // Get counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('consultation_requests')
        .select('status')

      if (statusError) throw statusError

      // Get requests by urgency
      const { data: urgencyCounts, error: urgencyError } = await supabase
        .from('consultation_requests')
        .select('urgency')

      if (urgencyError) throw urgencyError

      // Get recent requests
      const { data: recentRequests, error: recentError } = await supabase
        .from('consultation_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentError) throw recentError

      // Process status counts
      const statusStats = statusCounts.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Process urgency counts
      const urgencyStats = urgencyCounts.reduce((acc, item) => {
        acc[item.urgency] = (acc[item.urgency] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        data: {
          statusStats,
          urgencyStats,
          recentRequests,
          totalRequests: statusCounts.length
        },
        error: null
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return { data: null, error: error as Error }
    }
  }

  static async getRequestsByDateRange(startDate: string, endDate: string): Promise<ServiceResponse<ConsultationRequest[]>> {
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching requests by date range:', error)
      return { data: null, error: error as Error }
    }
  }

  static async getConversionMetrics(): Promise<ServiceResponse<{
    totalRequests: number
    completedRequests: number
    conversionRate: number
    averageValue: number
  }>> {
    try {
      const { data: allRequests, error: allError } = await supabase
        .from('consultation_requests')
        .select('status, estimated_value')

      if (allError) throw allError

      const totalRequests = allRequests.length
      const completedRequests = allRequests.filter(req => req.status === 'completed').length
      const conversionRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0
      
      const requestsWithValue = allRequests.filter(req => req.estimated_value && req.estimated_value > 0)
      const totalValue = requestsWithValue.reduce((sum, req) => sum + (req.estimated_value || 0), 0)
      const averageValue = requestsWithValue.length > 0 ? totalValue / requestsWithValue.length : 0

      return {
        data: {
          totalRequests,
          completedRequests,
          conversionRate,
          averageValue
        },
        error: null
      }
    } catch (error) {
      console.error('Error fetching conversion metrics:', error)
      return { data: null, error: error as Error }
    }
  }

  static async getServiceTypeBreakdown(): Promise<ServiceResponse<Record<string, number>>> {
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .select('service_type')

      if (error) throw error

      const breakdown = data.reduce((acc, item) => {
        acc[item.service_type] = (acc[item.service_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return { data: breakdown, error: null }
    } catch (error) {
      console.error('Error fetching service type breakdown:', error)
      return { data: null, error: error as Error }
    }
  }
}
