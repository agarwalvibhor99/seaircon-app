import { supabase } from './supabase'
import { ContactHistory, ContactHistoryInsert, ServiceResponse } from './types'

export class ContactHistoryService {
  static async add(data: ContactHistoryInsert): Promise<ServiceResponse<ContactHistory>> {
    try {
      const { data: result, error } = await supabase
        .from('contact_history')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return { data: result, error: null }
    } catch (error) {
      console.error('Error adding contact history:', error)
      return { data: null, error: error as Error }
    }
  }

  static async getByConsultationRequestId(consultationRequestId: string): Promise<ServiceResponse<ContactHistory[]>> {
    try {
      const { data, error } = await supabase
        .from('contact_history')
        .select('*')
        .eq('consultation_request_id', consultationRequestId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching contact history:', error)
      return { data: null, error: error as Error }
    }
  }

  static async getAll(): Promise<ServiceResponse<ContactHistory[]>> {
    try {
      const { data, error } = await supabase
        .from('contact_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching all contact history:', error)
      return { data: null, error: error as Error }
    }
  }

  static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('contact_history')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { data: null, error: null }
    } catch (error) {
      console.error('Error deleting contact history:', error)
      return { data: null, error: error as Error }
    }
  }
}
