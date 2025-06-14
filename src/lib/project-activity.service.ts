import { createBrowserClient } from '@supabase/ssr'
import type { ProjectActivity, ProjectActivityInsert } from './enhanced-types'

/**
 * Service for managing project activities and audit trail
 */
export class ProjectActivityService {
  private supabase

  constructor() {
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  /**
   * Log a new activity for a project
   */
  async logActivity(activity: ProjectActivityInsert): Promise<ProjectActivity | null> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) return null

      // Get employee ID
      const { data: employee } = await this.supabase
        .from('employees')
        .select('id')
        .eq('email', user.user.email)
        .single()

      if (!employee) return null

      const activityData = {
        ...activity,
        performed_by: employee.id,
        performed_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('project_activities')
        .insert([activityData])
        .select(`
          *,
          project:projects(project_name, project_number),
          performed_by_employee:employees!project_activities_performed_by_fkey(full_name)
        `)
        .single()

      if (error) {
        console.error('Error logging activity:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in logActivity:', error)
      return null
    }
  }

  /**
   * Get activities for a specific project
   */
  async getProjectActivities(projectId: string, limit = 50): Promise<ProjectActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_activities')
        .select(`
          *,
          project:projects(project_name, project_number),
          performed_by_employee:employees!project_activities_performed_by_fkey(full_name)
        `)
        .eq('project_id', projectId)
        .order('performed_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching activities:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProjectActivities:', error)
      return []
    }
  }

  /**
   * Get recent activities across all projects
   */
  async getRecentActivities(limit = 20): Promise<ProjectActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_activities')
        .select(`
          *,
          project:projects(project_name, project_number),
          performed_by_employee:employees!project_activities_performed_by_fkey(full_name)
        `)
        .order('performed_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent activities:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getRecentActivities:', error)
      return []
    }
  }

  /**
   * Convenience methods for common activities
   */
  async logQuoteCreated(projectId: string, quoteId: string, quoteNumber: string) {
    return this.logActivity({
      project_id: projectId,
      activity_type: 'quote_created',
      title: `Quote ${quoteNumber} created`,
      related_entity_type: 'quotation',
      related_entity_id: quoteId
    })
  }

  async logQuoteSent(projectId: string, quoteId: string, quoteNumber: string) {
    return this.logActivity({
      project_id: projectId,
      activity_type: 'quote_sent',
      title: `Quote ${quoteNumber} sent to customer`,
      related_entity_type: 'quotation',
      related_entity_id: quoteId
    })
  }

  async logQuoteApproved(projectId: string, quoteId: string, quoteNumber: string) {
    return this.logActivity({
      project_id: projectId,
      activity_type: 'quote_approved',
      title: `Quote ${quoteNumber} approved by customer`,
      related_entity_type: 'quotation',
      related_entity_id: quoteId
    })
  }

  async logQuoteRejected(projectId: string, quoteId: string, quoteNumber: string, reason?: string) {
    return this.logActivity({
      project_id: projectId,
      activity_type: 'quote_rejected',
      title: `Quote ${quoteNumber} rejected`,
      description: reason ? `Reason: ${reason}` : undefined,
      related_entity_type: 'quotation',
      related_entity_id: quoteId
    })
  }

  async logInvoiceCreated(projectId: string, invoiceId: string, invoiceNumber: string) {
    return this.logActivity({
      project_id: projectId,
      activity_type: 'invoice_created',
      title: `Invoice ${invoiceNumber} created`,
      related_entity_type: 'invoice',
      related_entity_id: invoiceId
    })
  }

  async logInvoiceSent(projectId: string, invoiceId: string, invoiceNumber: string) {
    return this.logActivity({
      project_id: projectId,
      activity_type: 'invoice_sent',
      title: `Invoice ${invoiceNumber} sent to customer`,
      related_entity_type: 'invoice',
      related_entity_id: invoiceId
    })
  }

  async logPaymentReceived(projectId: string, paymentId: string, amount: number, paymentReference: string) {
    return this.logActivity({
      project_id: projectId,
      activity_type: 'payment_received',
      title: `Payment received: ₹${amount.toLocaleString('en-IN')}`,
      description: `Payment reference: ${paymentReference}`,
      related_entity_type: 'payment',
      related_entity_id: paymentId
    })
  }

  async logProjectStatusChange(projectId: string, oldStatus: string, newStatus: string) {
    return this.logActivity({
      project_id: projectId,
      activity_type: 'status_changed',
      title: `Project status updated`,
      description: `Status changed from "${oldStatus}" to "${newStatus}"`
    })
  }

  async logNoteAdded(projectId: string, note: string) {
    return this.logActivity({
      project_id: projectId,
      activity_type: 'note_added',
      title: 'Note added to project',
      description: note.length > 100 ? note.substring(0, 100) + '...' : note
    })
  }

  /**
   * Get activity statistics for dashboard
   */
  async getActivityStats(days = 30) {
    try {
      const since = new Date()
      since.setDate(since.getDate() - days)

      const { data, error } = await this.supabase
        .from('project_activities')
        .select('activity_type, performed_at')
        .gte('performed_at', since.toISOString())

      if (error) {
        console.error('Error fetching activity stats:', error)
        return null
      }

      // Group by activity type
      const stats = data.reduce((acc: Record<string, number>, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
        return acc
      }, {})

      // Group by day for trend analysis
      const dailyStats = data.reduce((acc: Record<string, number>, activity) => {
        const day = new Date(activity.performed_at).toISOString().split('T')[0]
        acc[day] = (acc[day] || 0) + 1
        return acc
      }, {})

      return {
        totalActivities: data.length,
        byType: stats,
        byDay: dailyStats
      }
    } catch (error) {
      console.error('Error in getActivityStats:', error)
      return null
    }
  }
}

// Export singleton instance
export const projectActivityService = new ProjectActivityService()
