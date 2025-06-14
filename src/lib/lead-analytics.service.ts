// Lead Conversion Analytics Service
// Provides comprehensive analytics for Solution 1: Historical lead data tracking

import { createBrowserClient } from '@supabase/ssr'

export interface ConversionMetrics {
  totalLeads: number
  activeLeads: number
  convertedLeads: number
  lostLeads: number
  conversionRate: number
  averageTimeToConvert: number // in days
  totalProjectValue: number
  averageProjectValue: number
  conversionsByMonth: { month: string; conversions: number; conversionRate: number }[]
  conversionsByServiceType: { serviceType: string; conversions: number; conversionRate: number }[]
  leadSourcePerformance: { source: string; conversions: number; conversionRate: number }[]
}

export interface LeadConversionDetails {
  id: string
  name: string
  email: string
  serviceType: string
  createdAt: string
  convertedAt: string
  daysToConvert: number
  projectValue: number
  projectNumber: string
  projectName: string
}

export class LeadAnalyticsService {
  private static supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  /**
   * Get comprehensive conversion metrics for success rate tracking
   */
  static async getConversionMetrics(timeframe: '30d' | '90d' | '1y' | 'all' = '90d'): Promise<ConversionMetrics> {
    try {
      const timeframeDates = this.getTimeframeFilter(timeframe)
      
      // Get all leads within timeframe
      const { data: allLeads, error: leadsError } = await this.supabase
        .from('consultation_requests')
        .select('id, status, service_type, source, created_at, converted_at, converted_to_project_id')
        .gte('created_at', timeframeDates.startDate)
        .lte('created_at', timeframeDates.endDate)

      if (leadsError) throw leadsError

      // Get project values for converted leads
      const convertedLeadIds = allLeads
        ?.filter(lead => lead.status === 'won' && lead.converted_to_project_id)
        .map(lead => lead.converted_to_project_id) || []

      const { data: projects, error: projectsError } = convertedLeadIds.length > 0
        ? await this.supabase
            .from('projects')
            .select('id, project_value')
            .in('id', convertedLeadIds)
        : { data: [], error: null }

      if (projectsError) throw projectsError

      // Calculate metrics
      const totalLeads = allLeads?.length || 0
      const activeLeads = allLeads?.filter(lead => ['new', 'contacted', 'qualified', 'proposal_sent'].includes(lead.status)).length || 0
      const convertedLeads = allLeads?.filter(lead => lead.status === 'won').length || 0
      const lostLeads = allLeads?.filter(lead => ['lost', 'cancelled'].includes(lead.status)).length || 0
      const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100 * 100) / 100 : 0

      // Calculate average time to convert
      const convertedWithTime = allLeads?.filter(lead => 
        lead.status === 'won' && lead.converted_at && lead.created_at
      ) || []
      
      const avgTimeToConvert = convertedWithTime.length > 0
        ? Math.round(convertedWithTime.reduce((sum, lead) => {
            const createdDate = new Date(lead.created_at)
            const convertedDate = new Date(lead.converted_at!)
            const daysDiff = (convertedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
            return sum + daysDiff
          }, 0) / convertedWithTime.length)
        : 0

      // Calculate project values
      const totalProjectValue = projects?.reduce((sum, project) => sum + (project.project_value || 0), 0) || 0
      const averageProjectValue = convertedLeads > 0 ? Math.round(totalProjectValue / convertedLeads) : 0

      // Monthly conversion trends
      const conversionsByMonth = this.calculateMonthlyConversions(allLeads || [])

      // Service type performance
      const conversionsByServiceType = this.calculateServiceTypeConversions(allLeads || [])

      // Lead source performance
      const leadSourcePerformance = this.calculateSourcePerformance(allLeads || [])

      return {
        totalLeads,
        activeLeads,
        convertedLeads,
        lostLeads,
        conversionRate,
        averageTimeToConvert: avgTimeToConvert,
        totalProjectValue,
        averageProjectValue,
        conversionsByMonth,
        conversionsByServiceType,
        leadSourcePerformance
      }
    } catch (error) {
      console.error('Error fetching conversion metrics:', error)
      throw error
    }
  }

  /**
   * Get detailed conversion data for individual leads
   */
  static async getConversionDetails(limit: number = 50): Promise<LeadConversionDetails[]> {
    try {
      const { data, error } = await this.supabase
        .from('consultation_requests')
        .select(`
          id,
          name,
          email,
          service_type,
          created_at,
          converted_at,
          converted_to_project_id,
          projects!inner (
            project_number,
            project_name,
            project_value
          )
        `)
        .eq('status', 'won')
        .not('converted_to_project_id', 'is', null)
        .order('converted_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data?.map(lead => {
        const project = Array.isArray(lead.projects) ? lead.projects[0] : lead.projects
        return {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          serviceType: lead.service_type,
          createdAt: lead.created_at,
          convertedAt: lead.converted_at!,
          daysToConvert: Math.round(
            (new Date(lead.converted_at!).getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
          ),
          projectValue: project?.project_value || 0,
          projectNumber: project?.project_number || 'Unknown',
          projectName: project?.project_name || 'Unknown'
        }
      }) || []
    } catch (error) {
      console.error('Error fetching conversion details:', error)
      return []
    }
  }

  /**
   * Get success rate by lead source for marketing attribution
   */
  static async getSourceSuccessRates(): Promise<{ source: string; leads: number; conversions: number; rate: number }[]> {
    try {
      const { data, error } = await this.supabase
        .from('consultation_requests')
        .select('source, status')
        .not('source', 'is', null)

      if (error) throw error

      const sourceMap = new Map<string, { total: number; converted: number }>()

      data?.forEach(lead => {
        const source = lead.source || 'unknown'
        if (!sourceMap.has(source)) {
          sourceMap.set(source, { total: 0, converted: 0 })
        }
        const entry = sourceMap.get(source)!
        entry.total++
        if (lead.status === 'won') {
          entry.converted++
        }
      })

      return Array.from(sourceMap.entries()).map(([source, data]) => ({
        source,
        leads: data.total,
        conversions: data.converted,
        rate: data.total > 0 ? Math.round((data.converted / data.total) * 100 * 100) / 100 : 0
      })).sort((a, b) => b.rate - a.rate)
    } catch (error) {
      console.error('Error fetching source success rates:', error)
      return []
    }
  }

  // Helper methods
  private static getTimeframeFilter(timeframe: string) {
    const endDate = new Date()
    let startDate = new Date()

    switch (timeframe) {
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date('2020-01-01') // Arbitrary early date
        break
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }
  }

  private static calculateMonthlyConversions(leads: any[]) {
    const monthMap = new Map<string, { total: number; converted: number }>()

    leads.forEach(lead => {
      const month = new Date(lead.created_at).toISOString().substring(0, 7) // YYYY-MM format
      if (!monthMap.has(month)) {
        monthMap.set(month, { total: 0, converted: 0 })
      }
      const entry = monthMap.get(month)!
      entry.total++
      if (lead.status === 'won') {
        entry.converted++
      }
    })

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        conversions: data.converted,
        conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 100 * 100) / 100 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  private static calculateServiceTypeConversions(leads: any[]) {
    const serviceMap = new Map<string, { total: number; converted: number }>()

    leads.forEach(lead => {
      const serviceType = lead.service_type || 'unknown'
      if (!serviceMap.has(serviceType)) {
        serviceMap.set(serviceType, { total: 0, converted: 0 })
      }
      const entry = serviceMap.get(serviceType)!
      entry.total++
      if (lead.status === 'won') {
        entry.converted++
      }
    })

    return Array.from(serviceMap.entries()).map(([serviceType, data]) => ({
      serviceType,
      conversions: data.converted,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 100 * 100) / 100 : 0
    })).sort((a, b) => b.conversionRate - a.conversionRate)
  }

  private static calculateSourcePerformance(leads: any[]) {
    const sourceMap = new Map<string, { total: number; converted: number }>()

    leads.forEach(lead => {
      const source = lead.source || 'unknown'
      if (!sourceMap.has(source)) {
        sourceMap.set(source, { total: 0, converted: 0 })
      }
      const entry = sourceMap.get(source)!
      entry.total++
      if (lead.status === 'won') {
        entry.converted++
      }
    })

    return Array.from(sourceMap.entries()).map(([source, data]) => ({
      source,
      conversions: data.converted,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 100 * 100) / 100 : 0
    })).sort((a, b) => b.conversionRate - a.conversionRate)
  }
}
