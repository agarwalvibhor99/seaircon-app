import { supabase, createServerSupabaseClient } from './supabase'
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
      const { data: result, error } = await supabase
        .from('consultation_requests')
        .insert(data as any) // Temporary any cast to handle 'converted' status
        .select()
        .single()

      if (error) {
        throw error
      }
      
      return { data: result, error: null }
    } catch (error) {
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
      if (filters?.excludeStatuses) {
        query = query.not('status', 'in', `(${filters.excludeStatuses.join(',')})`)
      }
      if (filters?.excludeConverted) {
        query = query.neq('status', 'converted' as any)
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
      console.log('🗑️ ConsultationRequestsService.delete called with ID:', id)
      
      // Try to use server client with service role key first, fallback to regular client
      const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY
      console.log('🔑 Service role key available:', hasServiceRole)
      
      const clientToUse = hasServiceRole ? createServerSupabaseClient() : supabase
      console.log('🔧 Using client:', hasServiceRole ? 'Server (Service Role)' : 'Public (Anon)')
      
      const { error } = await clientToUse
        .from('consultation_requests')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Supabase delete error:', error)
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details
        })
        throw error
      }
      
      console.log('✅ Supabase delete successful for ID:', id)
      return { data: null, error: null }
    } catch (error) {
      console.error('💥 Error deleting consultation request:', error)
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
