// Base types for CRM operations

export interface ConsultationRequest {
  id: string
  name: string  // Database field name is 'name'
  email: string
  phone: string
  company?: string | null  // Database returns null, not undefined
  service_type: 'installation' | 'maintenance' | 'repair' | 'consultation'
  message: string | null  // Database allows null
  urgency_level: 'low' | 'medium' | 'high' | 'emergency'  // Database field name is 'urgency_level'
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled' | 'converted' | 'won' | 'lost'
  priority?: 'low' | 'medium' | 'high'
  assigned_to?: string | null
  estimated_value?: number | null
  next_follow_up?: string | null
  property_type?: string | null
  project_size?: string | null
  budget_range?: string | null
  source?: string | null
  // Conversion tracking fields for Solution 1
  converted_to_project_id?: string | null
  converted_at?: string | null
  created_at: string
  updated_at: string
  employees?: { full_name: string }  // For joined data
}

export interface ConsultationRequestInsert {
  name: string  // Database field name is 'name'
  email: string
  phone: string
  company?: string | null
  service_type: 'installation' | 'maintenance' | 'repair' | 'consultation'
  message: string
  urgency_level: 'low' | 'medium' | 'high' | 'emergency'
  status?: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled' | 'converted' | 'won' | 'lost'
  priority?: 'low' | 'medium' | 'high'
  assigned_to?: string
  estimated_value?: number
  next_follow_up?: string
  property_type?: string | null
  project_size?: string | null
  budget_range?: string | null
  source?: string | null
  preferred_contact_method?: string | null
  preferred_contact_time?: string | null
  notes?: string | null
}

export interface ConsultationRequestUpdate {
  name?: string
  email?: string
  phone?: string
  company?: string | null
  service_type?: 'installation' | 'maintenance' | 'repair' | 'consultation'
  message?: string
  urgency_level?: 'low' | 'medium' | 'high' | 'emergency'
  status?: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled' | 'converted' | 'won' | 'lost'
  priority?: 'low' | 'medium' | 'high'
  assigned_to?: string | null
  estimated_value?: number | null
  next_follow_up?: string | null
  // Conversion tracking fields for Solution 1
  converted_to_project_id?: string | null
  converted_at?: string | null
}

export interface ContactHistory {
  id: string
  consultation_request_id: string
  contact_type: 'email' | 'phone' | 'meeting' | 'note'
  contact_method: string
  notes: string
  created_by: string
  created_at: string
}

export interface ContactHistoryInsert {
  consultation_request_id: string
  contact_type: 'email' | 'phone' | 'meeting' | 'note'
  contact_method: string
  notes: string
  created_by: string
}

// Service response types
export interface ServiceResponse<T> {
  data: T | null
  error: Error | null
}

// Filter types
export interface ConsultationRequestFilters {
  status?: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled' | 'converted' | 'won' | 'lost'
  priority?: 'low' | 'medium' | 'high'
  assigned_to?: string
  limit?: number
  offset?: number
  search?: string
  excludeConverted?: boolean  // Legacy filter to exclude converted leads
  excludeWon?: boolean        // New filter to exclude won leads for active lead management
  includeConverted?: boolean  // New filter to specifically include converted leads for analytics
  includeWon?: boolean        // New filter to specifically include won leads for conversion tracking
}

// Dashboard stats types
export interface DashboardStats {
  statusStats: Record<string, number>
  urgencyStats: Record<string, number>
  recentRequests: ConsultationRequest[]
  totalRequests: number
}
