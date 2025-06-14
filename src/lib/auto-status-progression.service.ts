'use client'

import { LeadStatusHistoryService } from './lead-status-history.service'

interface StatusProgressionConfig {
  action: string
  fromStatuses: string[]
  toStatus: string
  condition?: (data: any) => boolean
}

const statusProgressionRules: StatusProgressionConfig[] = [
  // When a lead is contacted (email sent, phone call logged)
  {
    action: 'contact_attempted',
    fromStatuses: ['new'],
    toStatus: 'contacted'
  },
  
  // When lead responds positively or shows interest
  {
    action: 'lead_responded',
    fromStatuses: ['contacted'],
    toStatus: 'qualified'
  },
  
  // When quotation is created and sent
  {
    action: 'quotation_sent',
    fromStatuses: ['qualified', 'contacted'],
    toStatus: 'proposal_sent'
  },
  
  // When project is created from lead (automatically won)
  {
    action: 'project_created',
    fromStatuses: ['qualified', 'proposal_sent'],
    toStatus: 'won'
  },
  
  // When lead is marked as unresponsive or not interested
  {
    action: 'lead_lost',
    fromStatuses: ['contacted', 'qualified', 'proposal_sent'],
    toStatus: 'lost'
  }
]

export class AutoStatusProgressionService {
  /**
   * Automatically progress lead status based on user action
   */
  static async progressLeadStatus(
    leadId: string,
    currentStatus: string,
    action: string,
    actionData?: any
  ): Promise<{ success: boolean; newStatus?: string; error?: string }> {
    try {
      // Find applicable progression rule
      const rule = statusProgressionRules.find(r => 
        r.action === action && 
        r.fromStatuses.includes(currentStatus) &&
        (!r.condition || r.condition(actionData))
      )
      
      if (!rule) {
        // No automatic progression rule found - this is normal
        return { success: true }
      }
      
      // Apply the status progression
      const result = await LeadStatusHistoryService.updateLeadStatus(
        leadId,
        rule.toStatus,
        `Automatic progression: ${action}`,
        `Status automatically updated from ${currentStatus} to ${rule.toStatus} based on user action: ${action}`
      )
      
      if (result.success) {
        return { success: true, newStatus: rule.toStatus }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error in automatic status progression:', error)
      return { success: false, error: 'Failed to progress status automatically' }
    }
  }

  /**
   * Trigger status progression when contact is made
   */
  static async onContactMade(leadId: string, currentStatus: string, contactType: 'email' | 'phone' | 'meeting') {
    return this.progressLeadStatus(leadId, currentStatus, 'contact_attempted', { contactType })
  }

  /**
   * Trigger status progression when lead responds
   */
  static async onLeadResponded(leadId: string, currentStatus: string, responseType: 'positive' | 'neutral' | 'negative') {
    if (responseType === 'positive') {
      return this.progressLeadStatus(leadId, currentStatus, 'lead_responded', { responseType })
    } else if (responseType === 'negative') {
      return this.progressLeadStatus(leadId, currentStatus, 'lead_lost', { responseType })
    }
    return { success: true }
  }

  /**
   * Trigger status progression when quotation is sent
   */
  static async onQuotationSent(leadId: string, currentStatus: string, quotationId: string) {
    return this.progressLeadStatus(leadId, currentStatus, 'quotation_sent', { quotationId })
  }

  /**
   * Trigger status progression when project is created from lead
   */
  static async onProjectCreated(leadId: string, currentStatus: string, projectId: string) {
    return this.progressLeadStatus(leadId, currentStatus, 'project_created', { projectId })
  }

  /**
   * Trigger status progression when lead is lost
   */
  static async onLeadLost(leadId: string, currentStatus: string, reason: string) {
    return this.progressLeadStatus(leadId, currentStatus, 'lead_lost', { reason })
  }

  /**
   * Get suggested next actions based on current status
   */
  static getSuggestedActions(currentStatus: string): string[] {
    const suggestions: Record<string, string[]> = {
      new: [
        'Call the lead to introduce your services',
        'Send a welcome email with company brochure',
        'Schedule a site visit if applicable'
      ],
      contacted: [
        'Follow up on initial contact',
        'Send detailed service information',
        'Schedule a consultation meeting',
        'Qualify the lead (budget, need, timeline)'
      ],
      qualified: [
        'Prepare and send quotation',
        'Schedule detailed site survey',
        'Discuss project timeline and requirements'
      ],
      proposal_sent: [
        'Follow up on quotation status',
        'Address any questions or concerns',
        'Negotiate terms if needed',
        'Schedule project kickoff if accepted'
      ],
      won: [
        'Convert to project immediately',
        'Assign project team',
        'Send project welcome package',
        'Schedule project start date'
      ],
      lost: [
        'Archive lead record',
        'Analyze loss reason for improvement',
        'Add to nurture campaign if appropriate',
        'Request feedback for future improvements'
      ],
      cancelled: [
        'Archive lead record',
        'Document cancellation reason',
        'Set reminder for future follow-up if applicable'
      ]
    }
    
    return suggestions[currentStatus] || []
  }

  /**
   * Get status progression timeline for analytics
   */
  static getStatusFlow(): { status: string; label: string; description: string }[] {
    return [
      {
        status: 'new',
        label: 'New Lead',
        description: 'Lead just submitted inquiry'
      },
      {
        status: 'contacted',
        label: 'Contacted',
        description: 'Initial contact has been made'
      },
      {
        status: 'qualified',
        label: 'Qualified',
        description: 'Lead shows genuine interest and budget'
      },
      {
        status: 'proposal_sent',
        label: 'Proposal Sent',
        description: 'Quotation/proposal has been sent'
      },
      {
        status: 'won',
        label: 'Won',
        description: 'Lead accepted proposal - convert to project'
      },
      {
        status: 'lost',
        label: 'Lost',
        description: 'Lead decided not to proceed'
      },
      {
        status: 'cancelled',
        label: 'Cancelled',
        description: 'Lead went cold or unresponsive'
      }
    ]
  }
}
