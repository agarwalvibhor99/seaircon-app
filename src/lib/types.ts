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
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled' | 'converted'
  priority?: 'low' | 'medium' | 'high'
  assigned_to?: string | null
  estimated_value?: number | null
  next_follow_up?: string | null
  property_type?: string | null
  project_size?: string | null
  budget_range?: string | null
  source?: string | null
  created_at: string
  updated_at: string
  employees?: { full_name: string }  // For joined data
}

export interface ConsultationRequestInsert {
  name: string  // Database field name is 'name'
  email: string
  phone: string
  company?: string
  service_type: 'installation' | 'maintenance' | 'repair' | 'consultation'
  message: string
  urgency_level?: 'low' | 'medium' | 'high' | 'emergency'  // Database field name is 'urgency_level'
  status?: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled' | 'converted'
  priority?: 'low' | 'medium' | 'high'
  assigned_to?: string
  estimated_value?: number
  next_follow_up?: string
}

export interface ConsultationRequestUpdate {
  name?: string  // Database field name is 'name'
  email?: string
  phone?: string
  company?: string
  service_type?: 'installation' | 'maintenance' | 'repair' | 'consultation'
  message?: string
  urgency_level?: 'low' | 'medium' | 'high' | 'emergency'  // Database field name is 'urgency_level'
  status?: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high'
  assigned_to?: string
  estimated_value?: number
  next_follow_up?: string
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
  status?: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled' | 'converted'
  priority?: 'low' | 'medium' | 'high'
  assigned_to?: string
  limit?: number
  offset?: number
  search?: string
  excludeConverted?: boolean  // Legacy filter to exclude converted leads
  excludeStatuses?: string[]  // New filter to exclude multiple statuses
}

// Dashboard stats types
export interface DashboardStats {
  statusStats: Record<string, number>
  urgencyStats: Record<string, number>
  recentRequests: ConsultationRequest[]
  totalRequests: number
}
