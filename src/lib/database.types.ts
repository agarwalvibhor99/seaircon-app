export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      consultation_requests: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string
          company: string | null
          service_type: 'installation' | 'maintenance' | 'repair' | 'consultation'
          property_type: 'residential' | 'commercial' | 'industrial' | 'retail' | 'office' | 'other' | null
          project_size: 'small' | 'medium' | 'large' | 'enterprise' | null
          message: string | null
          preferred_contact_method: 'phone' | 'email' | 'whatsapp' | null
          preferred_contact_time: string | null
          urgency_level: 'low' | 'medium' | 'high' | 'emergency'
          budget_range: string | null
          status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high'
          assigned_to: string | null
          estimated_value: number | null
          next_follow_up: string | null
          follow_up_notes: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          source: string | null
          tags: string[] | null
          custom_fields: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone: string
          company?: string | null
          service_type: 'installation' | 'maintenance' | 'repair' | 'consultation'
          property_type?: 'residential' | 'commercial' | 'industrial' | 'retail' | 'office' | 'other' | null
          project_size?: 'small' | 'medium' | 'large' | 'enterprise' | null
          message?: string | null
          preferred_contact_method?: 'phone' | 'email' | 'whatsapp' | null
          preferred_contact_time?: string | null
          urgency_level?: 'low' | 'medium' | 'high' | 'emergency'
          budget_range?: string | null
          status?: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          assigned_to?: string | null
          estimated_value?: number | null
          next_follow_up?: string | null
          follow_up_notes?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          source?: string | null
          tags?: string[] | null
          custom_fields?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string
          company?: string | null
          service_type?: 'installation' | 'maintenance' | 'repair' | 'consultation'
          property_type?: 'residential' | 'commercial' | 'industrial' | 'retail' | 'office' | 'other' | null
          project_size?: 'small' | 'medium' | 'large' | 'enterprise' | null
          message?: string | null
          preferred_contact_method?: 'phone' | 'email' | 'whatsapp' | null
          preferred_contact_time?: string | null
          urgency_level?: 'low' | 'medium' | 'high' | 'emergency'
          budget_range?: string | null
          status?: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          assigned_to?: string | null
          estimated_value?: number | null
          next_follow_up?: string | null
          follow_up_notes?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          source?: string | null
          tags?: string[] | null
          custom_fields?: Json | null
        }
        Relationships: []
      }
      contact_history: {
        Row: {
          id: string
          consultation_request_id: string | null
          created_at: string
          contact_type: 'phone_call' | 'email' | 'meeting' | 'site_visit' | 'quote_sent' | 'follow_up' | 'note'
          contact_method: 'phone' | 'email' | 'in_person' | 'video_call' | 'whatsapp' | 'system' | null
          subject: string | null
          notes: string
          outcome: 'successful' | 'no_answer' | 'callback_requested' | 'not_interested' | 'needs_follow_up' | 'quote_requested' | 'scheduled_meeting' | null
          contacted_by: string | null
          duration_minutes: number | null
          next_action: string | null
          next_action_date: string | null
        }
        Insert: {
          id?: string
          consultation_request_id?: string | null
          created_at?: string
          contact_type: 'phone_call' | 'email' | 'meeting' | 'site_visit' | 'quote_sent' | 'follow_up' | 'note'
          contact_method?: 'phone' | 'email' | 'in_person' | 'video_call' | 'whatsapp' | 'system' | null
          subject?: string | null
          notes: string
          outcome?: 'successful' | 'no_answer' | 'callback_requested' | 'not_interested' | 'needs_follow_up' | 'quote_requested' | 'scheduled_meeting' | null
          contacted_by?: string | null
          duration_minutes?: number | null
          next_action?: string | null
          next_action_date?: string | null
        }
        Update: {
          id?: string
          consultation_request_id?: string | null
          created_at?: string
          contact_type?: 'phone_call' | 'email' | 'meeting' | 'site_visit' | 'quote_sent' | 'follow_up' | 'note'
          contact_method?: 'phone' | 'email' | 'in_person' | 'video_call' | 'whatsapp' | 'system' | null
          subject?: string | null
          notes?: string
          outcome?: 'successful' | 'no_answer' | 'callback_requested' | 'not_interested' | 'needs_follow_up' | 'quote_requested' | 'scheduled_meeting' | null
          contacted_by?: string | null
          duration_minutes?: number | null
          next_action?: string | null
          next_action_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_history_consultation_request_id_fkey"
            columns: ["consultation_request_id"]
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type ConsultationRequest = Database['public']['Tables']['consultation_requests']['Row']
export type ConsultationRequestInsert = Database['public']['Tables']['consultation_requests']['Insert']
export type ConsultationRequestUpdate = Database['public']['Tables']['consultation_requests']['Update']

export type ContactHistory = Database['public']['Tables']['contact_history']['Row']
export type ContactHistoryInsert = Database['public']['Tables']['contact_history']['Insert']
export type ContactHistoryUpdate = Database['public']['Tables']['contact_history']['Update']
