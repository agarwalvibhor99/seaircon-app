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
  assigned_to?: string | null
  estimated_value?: number | null
  next_follow_up?: string | null
}

export interface ConsultationRequestUpdate {
  name?: string  // Database field name is 'name'
  email?: string
  phone?: string
  company?: string
  service_type?: 'installation' | 'maintenance' | 'repair' | 'consultation'
  message?: string
  urgency_level?: 'low' | 'medium' | 'high' | 'emergency'  // Database field name is 'urgency_level'
  status?: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled' | 'converted'
  priority?: 'low' | 'medium' | 'high'
  assigned_to?: string | null
  estimated_value?: number | null
  next_follow_up?: string | null
  converted_to_project_id?: string | null
  converted_at?: string | null
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  service_type: string
  message: string
  urgency_level: string
  preferred_contact_method: string
  preferred_contact_time?: string
  location?: string
  property_type: string
  estimated_value?: number
  source: string
  notes?: string
  status: string
  created_at: string
  updated_at: string
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
  excludeConverted?: boolean  // New filter to exclude converted leads
}

// Dashboard stats types
export interface DashboardStats {
  statusStats: Record<string, number>
  urgencyStats: Record<string, number>
  recentRequests: ConsultationRequest[]
  totalRequests: number
}

// Project types
export interface Project {
  id: string
  project_name: string
  project_number: string
  description?: string
  project_type: string
  customer_id: string
  status: string
  priority: string
  start_date?: string
  estimated_completion?: string
  project_value?: number
  site_address?: string
  notes?: string
  created_at: string
  created_by: string
}
