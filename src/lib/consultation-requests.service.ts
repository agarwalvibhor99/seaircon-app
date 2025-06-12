import { supabase } from './supabase'
import { 
  ConsultationRequest, 
  ConsultationRequestInsert, 
  ConsultationRequestUpdate, 
  ConsultationRequestFilters,
  ServiceResponse 
} from './types'

export class ConsultationRequestsService {
  static async create(data: ConsultationRequestInsert): Promise<ServiceResponse<ConsultationRequest>> {
    try {
      console.log('Creating consultation request with data:', data)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      const { data: result, error } = await supabase
        .from('consultation_requests')
        .insert(data)
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('Successfully created consultation request:', result)
      return { data: result, error: null }
    } catch (error) {
      console.error('Error creating consultation request:', error)
      console.error('Error type:', typeof error)
      console.error('Error keys:', Object.keys(error as any))
      return { data: null, error: error as Error }
    }
  }

  static async getAll(filters?: ConsultationRequestFilters): Promise<ServiceResponse<ConsultationRequest[]>> {
    try {
      let query = supabase
        .from('consultation_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching consultation requests:', error)
      return { data: null, error: error as Error }
    }
  }

  static async getById(id: string): Promise<ServiceResponse<ConsultationRequest>> {
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching consultation request:', error)
      return { data: null, error: error as Error }
    }
  }

  static async update(id: string, updates: ConsultationRequestUpdate): Promise<ServiceResponse<ConsultationRequest>> {
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating consultation request:', error)
      return { data: null, error: error as Error }
    }
  }

  static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('consultation_requests')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { data: null, error: null }
    } catch (error) {
      console.error('Error deleting consultation request:', error)
      return { data: null, error: error as Error }
    }
  }

  static async search(searchTerm: string): Promise<ServiceResponse<ConsultationRequest[]>> {
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error searching consultation requests:', error)
      return { data: null, error: error as Error }
    }
  }

  static async getUpcomingFollowUps(): Promise<ServiceResponse<ConsultationRequest[]>> {
    try {
      const today = new Date()
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)

      const { data, error } = await supabase
        .from('consultation_requests')
        .select('*')
        .not('next_follow_up', 'is', null)
        .lte('next_follow_up', nextWeek.toISOString())
        .order('next_follow_up', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching upcoming follow-ups:', error)
      return { data: null, error: error as Error }
    }
  }
}
