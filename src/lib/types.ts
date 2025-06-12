// Base types for CRM operations
export interface ConsultationRequest {
  id: string
  full_name: string
  email: string
  phone: string
  company?: string
  service_type: 'installation' | 'maintenance' | 'repair' | 'consultation'
  message: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  assigned_to?: string
  estimated_value?: number
  next_follow_up?: string
  property_type?: string
  project_size?: string
  budget_range?: string
  source?: string
  created_at: string
  updated_at: string
}

export interface ConsultationRequestInsert {
  full_name: string
  email: string
  phone: string
  company?: string
  service_type: 'installation' | 'maintenance' | 'repair' | 'consultation'
  message: string
  urgency?: 'low' | 'medium' | 'high' | 'emergency'
  status?: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high'
  assigned_to?: string
  estimated_value?: number
  next_follow_up?: string
}

export interface ConsultationRequestUpdate {
  full_name?: string
  email?: string
  phone?: string
  company?: string
  service_type?: 'installation' | 'maintenance' | 'repair' | 'consultation'
  message?: string
  urgency?: 'low' | 'medium' | 'high' | 'emergency'
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
  status?: string
  priority?: string
  assigned_to?: string
  limit?: number
  offset?: number
}

// Dashboard stats types
export interface DashboardStats {
  statusStats: Record<string, number>
  urgencyStats: Record<string, number>
  recentRequests: ConsultationRequest[]
  totalRequests: number
}
