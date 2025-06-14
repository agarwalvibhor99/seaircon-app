import { createBrowserClient } from '@supabase/ssr'

export interface StatusHistoryEntry {
  id: string
  consultation_request_id: string
  previous_status: string | null
  new_status: string
  changed_by: string | null
  change_reason: string | null
  notes: string | null
  created_at: string
  changed_at?: string // Optional for backward compatibility
}

export interface StatusHistoryInsert {
  consultation_request_id: string
  previous_status?: string | null
  new_status: string
  changed_by?: string | null
  change_reason?: string | null
  notes?: string | null
}

// Initialize Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class LeadStatusHistoryService {
  /**
   * Get status history for a specific consultation request
   * Note: This will work after the database migration is applied
   */
  static async getStatusHistory(consultationRequestId: string): Promise<StatusHistoryEntry[]> {
    try {
      // Use raw SQL query to avoid type issues before migration
      const { data, error } = await supabase.rpc('get_lead_status_history', {
        lead_id: consultationRequestId
      })

      if (error) {
        console.error('Error fetching status history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching status history:', error)
      return []
    }
  }

  /**
   * Manually add a status history entry (for cases where we want to add custom context)
   */
  static async addStatusHistoryEntry(entry: StatusHistoryInsert): Promise<boolean> {
    try {
      // Use raw insert for now to avoid type issues
      const { error } = await supabase.rpc('add_status_history_entry', entry)

      if (error) {
        console.error('Error adding status history entry:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error adding status history entry:', error)
      return false
    }
  }

  /**
   * Update consultation request status with tracking
   */
  static async updateLeadStatus(
    leadId: string, 
    newStatus: string, 
    reason?: string, 
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the existing API endpoint to update status
      const response = await fetch(`/api/consultation-requests?id=${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          // Add change tracking info in notes if provided
          notes: notes ? `${reason ? `[${reason}] ` : ''}${notes}` : undefined
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Failed to update status' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updateLeadStatus:', error)
      return { success: false, error: 'Unexpected error occurred' }
    }
  }
}
