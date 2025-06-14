// Enhanced Database Types for Project-Centric CRM
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ==================== CORE ENTITIES ====================

// Projects - The Parent Entity (Enhanced)
export interface Project {
  id: string
  project_name: string
  project_number: string // Auto-generated: P001, P002, etc.
  description?: string
  
  // Core CRM fields
  project_id: string // Same as id, for consistency
  client_id: string // References customer_id
  address: string // Primary project address
  project_type: 'installation' | 'maintenance' | 'repair' | 'amc' | 'consultation' | 'other'
  start_date?: string
  
  // Enhanced workflow fields
  estimated_value: number
  project_address: string // Detailed address
  city?: string
  state?: string
  postal_code?: string
  
  // Status and workflow
  status: 'draft' | 'planning' | 'approved' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Relationships
  customer_id: string // Same as client_id
  project_manager_id?: string
  
  // Dates
  estimated_completion?: string
  actual_completion?: string
  created_at: string
  updated_at: string
  
  // Additional info
  budget?: number
  notes?: string
  tags?: string[]
  
  // Related entities (for joins)
  customer?: Customer
  project_manager?: Employee
  quotations?: Quotation[]
  invoices?: Invoice[]
  payments?: Payment[]
  activities?: ProjectActivity[]
}

// Customers (Enhanced)
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  customer_type: 'individual' | 'business' | 'government'
  created_at: string
  updated_at: string
  notes?: string
  
  // Related entities
  projects?: Project[]
  quotations?: Quotation[]
  invoices?: Invoice[]
  payments?: Payment[]
}

// Employees
export interface Employee {
  id: string
  full_name: string
  email: string
  phone?: string
  role: 'admin' | 'manager' | 'technician' | 'sales' | 'support'
  department?: string
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Related entities
  managed_projects?: Project[]
  created_quotations?: Quotation[]
  recorded_payments?: Payment[]
  activities?: ProjectActivity[]
}

// ==================== QUOTATIONS (Enhanced with Versioning) ====================

export interface Quotation {
  id: string
  
  // Quote identification with auto-incrementing and versioning
  quote_id: string // Same as id for consistency
  quote_number: string // Q001, Q002, etc. (auto-incremented)
  version: string // v1, v2, v3, etc.
  quote_title: string // Title/subject of quote
  
  // Status workflow (Enhanced)
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired' | 'superseded'
  
  // Relationships
  project_id: string
  customer_id: string
  created_by: string
  
  // Financial fields
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_percentage?: number
  discount_amount?: number
  total_amount: number
  amount_received?: number // Track payments against this quote
  balance_due?: number // Calculated field
  
  // Dates
  issue_date: string
  valid_until: string
  sent_date?: string
  approved_date?: string
  created_at: string
  updated_at: string
  
  // Content fields
  description?: string
  scope_of_work: string // Required field as per spec
  terms_and_conditions?: string
  notes?: string
  
  // Versioning metadata
  parent_quote_id?: string // For version tracking
  is_latest_version: boolean
  superseded_by?: string // ID of newer version
  
  // Related entities
  project?: Project
  customer?: Customer
  created_by_employee?: Employee
  quote_items?: QuotationItem[]
  invoices?: Invoice[] // Invoices created from this quote
  payments?: Payment[] // Direct payments to this quote
  newer_versions?: Quotation[] // If this is superseded
}

export interface QuotationItem {
  id: string
  quotation_id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total_amount: number
  category?: string
  notes?: string
  created_at: string
  
  // Line item order
  sort_order?: number
}

// Quote versioning helper interface
export interface QuoteVersionInfo {
  base_quote_number: string // Q001
  current_version: string // v3
  all_versions: Quotation[]
  latest_quote: Quotation
}

// ==================== INVOICES (Enhanced for Quote Relationship) ====================

export interface Invoice {
  id: string
  invoice_number: string
  
  // Enhanced for Quote relationship - Multiple quotes support
  invoice_type: 'quote' | 'proforma' | 'invoice' | 'credit_note'
  quote_ids: string[] // Array to link multiple quotes
  quote_versions?: string[] // Corresponding versions
  
  // Status
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partial'
  
  // Relationships
  project_id: string
  customer_id: string
  created_by: string
  
  // Financial
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_percentage?: number
  discount_amount?: number
  total_amount: number
  amount_paid: number
  balance_due: number
  
  // Dates
  issue_date: string
  due_date: string
  sent_date?: string
  paid_date?: string
  created_at: string
  updated_at: string
  
  // Terms
  payment_terms?: string
  notes?: string
  
  // Related entities
  project?: Project
  customer?: Customer
  quotations?: Quotation[] // Multiple quotes
  created_by_employee?: Employee
  invoice_items?: InvoiceItem[]
  payments?: Payment[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total_amount: number
  category?: string
  notes?: string
  created_at: string
  
  // Link to quote item if created from quote
  quote_item_id?: string
  sort_order?: number
}

// ==================== PAYMENTS (Enhanced) ====================

export interface Payment {
  id: string
  payment_id: string // Same as id for consistency
  payment_reference: string
  
  // Enhanced linking - Support multiple entities
  project_id: string // Required - always link to project
  quote_ids?: string[] // Can link to multiple quotes
  invoice_ids?: string[] // Can link to multiple invoices
  
  // Payment details
  amount: number
  payment_date: string
  payment_mode: 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'card' | 'other'
  transaction_id?: string
  receipt_number?: string
  
  // File upload
  receipt_upload?: string // File path/URL for receipt
  
  // Status
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  
  // Relationships
  customer_id: string
  recorded_by: string
  
  // Additional info
  note?: string // Payment note
  bank_details?: string
  created_at: string
  updated_at: string
  
  // Partial payment tracking
  is_partial_payment: boolean
  remaining_balance?: number
  
  // Related entities
  project?: Project
  quotations?: Quotation[]
  invoices?: Invoice[]
  customer?: Customer
  recorded_by_employee?: Employee
}

// ==================== ACTIVITY LOG (Enhanced) ====================

export interface ProjectActivity {
  id: string
  log_id: string // Same as id for consistency
  project_id: string
  
  // Activity details
  type: 'quote' | 'invoice' | 'payment' | 'project' | 'other' // High level type
  activity_type: 'quote_created' | 'quote_sent' | 'quote_approved' | 'quote_rejected' | 
                 'invoice_created' | 'invoice_sent' | 'payment_received' | 'status_changed' |
                 'project_created' | 'project_updated' | 'note_added' | 'file_uploaded'
  
  reference_id: string // ID of the related entity (quote_id, invoice_id, payment_id)
  description: string // Activity description
  timestamp: string // Activity timestamp
  
  // Enhanced fields
  title: string
  
  // Related entities
  related_entity_type?: 'quotation' | 'invoice' | 'payment' | 'customer'
  related_entity_id?: string
  
  // User and timing
  performed_by: string
  performed_at: string
  
  // Additional data
  metadata?: Json
  
  // Related entities
  project?: Project
  performed_by_employee?: Employee
}

// ==================== LEADS (Enhanced Integration) ====================

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  
  // Enhanced for project conversion
  lead_source: 'website' | 'referral' | 'social_media' | 'advertisement' | 'cold_call' | 'other'
  service_type: 'installation' | 'maintenance' | 'repair' | 'amc' | 'consultation'
  
  // Status workflow
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost'
  priority: 'low' | 'medium' | 'high'
  
  // Project potential
  estimated_value?: number
  project_type?: string
  timeline?: string
  
  // Assignment and follow-up
  assigned_to?: string
  next_follow_up?: string
  
  // Conversion tracking
  converted_to_project?: boolean
  project_id?: string // Link when converted
  
  // Location
  address?: string
  city?: string
  state?: string
  
  // Additional
  notes?: string
  tags?: string[]
  created_at: string
  updated_at: string
  
  // Related entities
  assigned_employee?: Employee
  converted_project?: Project
}

// ==================== INSERT/UPDATE TYPES ====================

export type ProjectInsert = Omit<Project, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'customer' | 'project_manager' | 'quotations' | 'invoices' | 'payments' | 'activities'>
export type ProjectUpdate = Partial<ProjectInsert>

export type QuotationInsert = Omit<Quotation, 'id' | 'quote_id' | 'created_at' | 'updated_at' | 'project' | 'customer' | 'created_by_employee' | 'quote_items' | 'invoices' | 'payments' | 'newer_versions'>
export type QuotationUpdate = Partial<QuotationInsert>

export type InvoiceInsert = Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'project' | 'customer' | 'quotations' | 'created_by_employee' | 'invoice_items' | 'payments'>
export type InvoiceUpdate = Partial<InvoiceInsert>

export type PaymentInsert = Omit<Payment, 'id' | 'payment_id' | 'created_at' | 'updated_at' | 'project' | 'quotations' | 'invoices' | 'customer' | 'recorded_by_employee'>
export type PaymentUpdate = Partial<PaymentInsert>

export type ProjectActivityInsert = Omit<ProjectActivity, 'id' | 'log_id' | 'performed_at' | 'timestamp' | 'project' | 'performed_by_employee'>

export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assigned_employee' | 'converted_project'>
export type LeadUpdate = Partial<LeadInsert>

export type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'projects' | 'quotations' | 'invoices' | 'payments'>
export type CustomerUpdate = Partial<CustomerInsert>

// ==================== RESPONSE TYPES ====================

export interface ServiceResponse<T> {
  data: T | null
  error: Error | null
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ==================== FILTER TYPES ====================

export interface ProjectFilters {
  status?: string
  priority?: string
  project_type?: string
  customer_id?: string
  project_manager_id?: string
  search?: string
  page?: number
  limit?: number
}

export interface QuotationFilters {
  status?: string
  project_id?: string
  customer_id?: string
  version?: string
  is_latest_version?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface InvoiceFilters {
  status?: string
  invoice_type?: string
  project_id?: string
  customer_id?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaymentFilters {
  payment_mode?: string
  status?: string
  project_id?: string
  customer_id?: string
  is_partial_payment?: boolean
  search?: string
  page?: number
  limit?: number
}

// ==================== DASHBOARD TYPES ====================

export interface ProjectDashboardStats {
  total_projects: number
  active_projects: number
  completed_projects: number
  total_value: number
  projects_by_status: Record<string, number>
  projects_by_type: Record<string, number>
  recent_activities: ProjectActivity[]
}

export interface FinancialStats {
  total_quotes_value: number
  total_invoiced: number
  total_received: number
  outstanding_amount: number
  quotes_by_status: Record<string, number>
  invoices_by_status: Record<string, number>
  monthly_revenue: Array<{ month: string; amount: number }>
}

// ==================== WORKFLOW TYPES ====================

export interface QuoteToInvoiceConversion {
  quote_ids: string[] // Multiple quotes can be converted
  invoice_type: 'full' | 'partial' | 'advance'
  percentage?: number // For partial invoices
  due_date: string
  payment_terms?: string
  notes?: string
}

export interface ProjectConversionData {
  lead_id: string
  project_data: ProjectInsert
  create_initial_quote?: boolean
  quote_data?: Partial<QuotationInsert>
}

// ==================== AUTO-NUMBERING TYPES ====================

export interface AutoNumberConfig {
  entity_type: 'project' | 'quote' | 'invoice' | 'payment'
  prefix: string // P, Q, I, PAY
  current_number: number
  padding: number // Zero padding (001, 0001, etc.)
}

// ==================== BALANCE TRACKING TYPES ====================

export interface QuoteBalance {
  quote_id: string
  quote_number: string
  total_amount: number
  amount_received: number
  balance_due: number
  last_payment_date?: string
}

export interface ProjectFinancialSummary {
  project_id: string
  total_quoted: number
  total_invoiced: number
  total_received: number
  outstanding_quotes: number
  outstanding_invoices: number
  profit_margin?: number
}
