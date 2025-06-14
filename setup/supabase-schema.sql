-- SEAircon Complete CRM Database Schema - FRESH INSTALL (FIXED ORDER)
-- Execute this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ===========================================
-- EMPLOYEES & AUTHENTICATION (First - no dependencies)
-- ===========================================

-- Employee/Admin users table
CREATE TABLE employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'employee', -- 'admin', 'manager', 'employee', 'technician'
  phone VARCHAR(20),
  department VARCHAR(100), -- 'sales', 'technical', 'operations', 'accounts'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- CONSULTATION REQUESTS (Second - depends only on employees)
-- ===========================================

-- Create consultation_requests table (main leads table)
CREATE TABLE consultation_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  company VARCHAR(255),
  service_type VARCHAR(100) NOT NULL,
  message TEXT,
  urgency_level VARCHAR(20) DEFAULT 'medium',
  preferred_contact_method VARCHAR(20) DEFAULT 'email',
  preferred_contact_time VARCHAR(50),
  status VARCHAR(20) DEFAULT 'new',
  assigned_to UUID REFERENCES employees(id),
  estimated_value DECIMAL(10,2),
  follow_up_date TIMESTAMP,
  source VARCHAR(50) DEFAULT 'website',
  notes TEXT,
  -- Enhanced fields for CRM
  location TEXT,
  property_type VARCHAR(50) DEFAULT 'residential',
  lead_score INTEGER DEFAULT 0,
  qualification_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- CUSTOMERS (Third - depends on consultation_requests and employees)
-- ===========================================

-- Customer profiles (converted leads)
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_request_id UUID REFERENCES consultation_requests(id),
  customer_code VARCHAR(50) UNIQUE, -- SEA-CUS-001
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  company VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  gst_number VARCHAR(15),
  property_type VARCHAR(50),
  customer_type VARCHAR(50) DEFAULT 'individual', -- 'individual', 'business'
  assigned_manager UUID REFERENCES employees(id),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- SITE VISITS & ASSESSMENTS (Fourth - depends on customers)
-- ===========================================

CREATE TABLE site_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_request_id UUID REFERENCES consultation_requests(id),
  customer_id UUID REFERENCES customers(id),
  visit_date TIMESTAMP NOT NULL,
  technician_id UUID REFERENCES employees(id),
  supervisor_id UUID REFERENCES employees(id),
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  visit_type VARCHAR(50) DEFAULT 'assessment', -- 'assessment', 'follow_up', 'maintenance'
  
  -- Assessment details
  site_assessment TEXT,
  electrical_requirements TEXT,
  ducting_requirements TEXT,
  unit_preferences TEXT,
  special_requirements TEXT,
  estimated_cost DECIMAL(10,2),
  
  -- Media uploads (JSON array of URLs)
  site_images JSON,
  floor_plan JSON,
  notes TEXT,
  duration_hours DECIMAL(3,1),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- QUOTATIONS & PROPOSALS (Fifth - depends on customers and site_visits)
-- ===========================================

CREATE TABLE quotations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quotation_number VARCHAR(50) UNIQUE, -- SEA-QUO-001
  customer_id UUID REFERENCES customers(id),
  site_visit_id UUID REFERENCES site_visits(id),
  created_by UUID REFERENCES employees(id),
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'approved', 'rejected', 'expired'
  
  -- Quotation details
  title VARCHAR(255),
  description TEXT,
  total_amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL,
  
  -- Terms
  validity_days INTEGER DEFAULT 30,
  payment_terms TEXT,
  delivery_timeline VARCHAR(100),
  warranty_period VARCHAR(100),
  
  -- Sharing
  shared_via VARCHAR(50), -- 'email', 'whatsapp', 'direct'
  shared_at TIMESTAMP,
  client_viewed_at TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quotation line items
CREATE TABLE quotation_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  item_type VARCHAR(50), -- 'ac_unit', 'ducting', 'labor', 'material', 'service'
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20), -- 'piece', 'meter', 'sqft', 'hour'
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  specifications JSON,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- PROJECTS & PLANNING (Sixth - depends on customers and quotations)
-- ===========================================

CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_number VARCHAR(50) UNIQUE, -- SEA-PRJ-001
  customer_id UUID REFERENCES customers(id),
  quotation_id UUID REFERENCES quotations(id),
  project_manager_id UUID REFERENCES employees(id),
  supervisor_id UUID REFERENCES employees(id),
  
  -- Project details
  project_name VARCHAR(255) NOT NULL,
  description TEXT,
  project_type VARCHAR(50), -- 'installation', 'maintenance', 'repair', 'amc'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'approved', 'in_progress', 'completed', 'cancelled'
  
  -- Timeline
  estimated_start_date DATE,
  actual_start_date DATE,
  estimated_end_date DATE,
  actual_end_date DATE,
  estimated_duration_days INTEGER,
  
  -- Financial
  project_value DECIMAL(12,2),
  advance_amount DECIMAL(10,2),
  advance_received_date DATE,
  
  -- Location
  site_address TEXT,
  site_contact_person VARCHAR(255),
  site_contact_phone VARCHAR(20),
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project team assignments
CREATE TABLE project_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id),
  role VARCHAR(50), -- 'manager', 'supervisor', 'technician', 'helper'
  assigned_date DATE DEFAULT CURRENT_DATE,
  removed_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project materials/inventory
CREATE TABLE project_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  material_name VARCHAR(255) NOT NULL,
  material_type VARCHAR(100), -- 'ac_unit', 'ducting', 'electrical', 'consumable'
  brand VARCHAR(100),
  model VARCHAR(100),
  specifications JSON,
  quantity_required DECIMAL(10,2) NOT NULL,
  quantity_allocated DECIMAL(10,2) DEFAULT 0,
  quantity_used DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(20),
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  supplier VARCHAR(255),
  status VARCHAR(50) DEFAULT 'required', -- 'required', 'ordered', 'received', 'allocated', 'used'
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- INSTALLATION & PROGRESS TRACKING (Seventh - depends on projects)
-- ===========================================

CREATE TABLE installation_phases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase_name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  estimated_duration_hours DECIMAL(5,1),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
  assigned_to UUID REFERENCES employees(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily progress updates
CREATE TABLE progress_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  phase_id UUID REFERENCES installation_phases(id),
  update_date DATE DEFAULT CURRENT_DATE,
  updated_by UUID REFERENCES employees(id),
  
  -- Progress details
  work_completed TEXT,
  materials_used JSON,
  team_members JSON, -- Array of employee IDs
  hours_worked DECIMAL(4,1),
  progress_percentage INTEGER DEFAULT 0,
  
  -- Issues and challenges
  issues_faced TEXT,
  solutions_applied TEXT,
  pending_work TEXT,
  next_day_plan TEXT,
  
  -- Media (JSON array of image URLs)
  progress_images JSON,
  notes TEXT,
  
  -- Weather/site conditions
  weather_conditions VARCHAR(100),
  site_accessibility VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quality checkpoints
CREATE TABLE quality_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  phase_id UUID REFERENCES installation_phases(id),
  checklist_name VARCHAR(255) NOT NULL,
  checked_by UUID REFERENCES employees(id),
  check_date DATE DEFAULT CURRENT_DATE,
  
  -- Checklist items (JSON for flexibility)
  checklist_items JSON NOT NULL,
  overall_status VARCHAR(50), -- 'passed', 'failed', 'needs_review'
  issues_found TEXT,
  corrective_actions TEXT,
  
  approved_by UUID REFERENCES employees(id),
  approval_date DATE,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- CUSTOMER SIGN-OFF & COMPLETION (Eighth - depends on projects)
-- ===========================================

CREATE TABLE project_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  completion_date DATE DEFAULT CURRENT_DATE,
  completed_by UUID REFERENCES employees(id),
  
  -- Customer acceptance
  customer_signature_url TEXT,
  customer_feedback TEXT,
  customer_rating INTEGER, -- 1-5 stars
  acceptance_method VARCHAR(50), -- 'digital_signature', 'otp', 'physical_signature'
  otp_code VARCHAR(10),
  otp_verified_at TIMESTAMP,
  
  -- Final deliverables
  completion_certificate_url TEXT,
  warranty_certificate_url TEXT,
  operation_manual_url TEXT,
  maintenance_schedule JSON,
  
  -- Final inspection
  final_inspection_by UUID REFERENCES employees(id),
  inspection_passed BOOLEAN DEFAULT false,
  inspection_notes TEXT,
  punch_list TEXT, -- Remaining minor items
  
  -- Handover
  handover_completed BOOLEAN DEFAULT false,
  handover_date DATE,
  handover_to VARCHAR(255), -- Customer contact person
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- INVOICING & PAYMENTS (Ninth - depends on customers, projects, quotations)
-- ===========================================

CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE, -- SEA-INV-001
  customer_id UUID REFERENCES customers(id),
  project_id UUID REFERENCES projects(id),
  quotation_id UUID REFERENCES quotations(id),
  created_by UUID REFERENCES employees(id),
  
  -- Invoice details
  invoice_type VARCHAR(50), -- 'advance', 'progress', 'final', 'amc'
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  
  -- Amounts
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 18.00,
  tax_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  
  -- Payment tracking
  amount_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled'
  
  -- Payment details
  payment_terms VARCHAR(100),
  payment_method VARCHAR(50), -- 'bank_transfer', 'upi', 'card', 'cash', 'cheque'
  payment_link TEXT,
  
  notes TEXT,
  sent_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE invoice_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment records
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  customer_id UUID REFERENCES customers(id),
  payment_reference VARCHAR(100), -- Transaction ID, cheque number, etc.
  
  -- Payment details
  payment_date DATE DEFAULT CURRENT_DATE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
  
  -- Processing
  processed_by UUID REFERENCES employees(id),
  verified_by UUID REFERENCES employees(id),
  verification_date DATE,
  
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- AMC & MAINTENANCE (Tenth - depends on customers and projects)
-- ===========================================

CREATE TABLE amc_contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contract_number VARCHAR(50) UNIQUE, -- SEA-AMC-001
  customer_id UUID REFERENCES customers(id),
  project_id UUID REFERENCES projects(id),
  
  -- Contract details
  contract_name VARCHAR(255),
  contract_type VARCHAR(50), -- 'basic', 'premium', 'comprehensive'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Coverage
  coverage_details JSON, -- What's included/excluded
  service_frequency VARCHAR(50), -- 'monthly', 'quarterly', 'half_yearly'
  response_time_hours INTEGER DEFAULT 24,
  
  -- Financial
  annual_amount DECIMAL(10,2) NOT NULL,
  payment_frequency VARCHAR(20), -- 'annual', 'quarterly', 'monthly'
  
  -- Assignment
  service_manager_id UUID REFERENCES employees(id),
  primary_technician_id UUID REFERENCES employees(id),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'expired', 'cancelled', 'renewed'
  auto_renewal BOOLEAN DEFAULT false,
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AMC service visits
CREATE TABLE amc_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amc_contract_id UUID REFERENCES amc_contracts(id),
  visit_type VARCHAR(50), -- 'scheduled', 'emergency', 'breakdown'
  scheduled_date DATE,
  actual_date DATE,
  technician_id UUID REFERENCES employees(id),
  
  -- Service details
  services_performed JSON,
  materials_used JSON,
  issues_found TEXT,
  recommendations TEXT,
  
  -- Customer feedback
  customer_satisfaction INTEGER, -- 1-5
  customer_comments TEXT,
  customer_signature_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  duration_hours DECIMAL(3,1),
  
  -- Follow-up
  next_visit_due DATE,
  emergency_required BOOLEAN DEFAULT false,
  
  visit_report_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- NOTIFICATIONS & SYSTEM (Eleventh)
-- ===========================================

-- Automated reminders and notifications
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  type VARCHAR(50) NOT NULL, -- 'reminder', 'task', 'alert', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  
  -- Related entities
  related_type VARCHAR(50), -- 'lead', 'project', 'invoice', 'amc'
  related_id UUID,
  
  -- Status
  status VARCHAR(50) DEFAULT 'unread', -- 'unread', 'read', 'dismissed', 'acted_upon'
  priority VARCHAR(20) DEFAULT 'medium',
  
  -- Scheduling
  send_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  action_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- System settings for business logic
CREATE TABLE system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50), -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  category VARCHAR(100),
  is_system BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES employees(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- File uploads and documents
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  related_type VARCHAR(50) NOT NULL, -- 'customer', 'project', 'invoice', 'quotation'
  related_id UUID NOT NULL,
  
  -- File details
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50), -- 'image', 'pdf', 'document', 'video'
  file_size INTEGER,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  
  -- Metadata
  document_type VARCHAR(100), -- 'site_photo', 'floor_plan', 'certificate', 'invoice'
  description TEXT,
  tags JSON,
  
  -- Access control
  uploaded_by UUID REFERENCES employees(id),
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- CONTACT HISTORY (Last - depends on multiple tables)
-- ===========================================

-- Contact history for tracking communications
CREATE TABLE contact_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_request_id UUID REFERENCES consultation_requests(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  project_id UUID REFERENCES projects(id),
  contact_type VARCHAR(50) NOT NULL, -- 'call', 'email', 'whatsapp', 'visit', 'sms'
  contact_date TIMESTAMP DEFAULT NOW(),
  initiated_by VARCHAR(50), -- 'employee', 'customer', 'system'
  employee_id UUID REFERENCES employees(id),
  summary TEXT,
  outcome VARCHAR(100),
  next_action VARCHAR(255),
  next_action_date DATE,
  contacted_by VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Create indexes for better performance
CREATE INDEX idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX idx_consultation_requests_created_at ON consultation_requests(created_at);
CREATE INDEX idx_consultation_requests_email ON consultation_requests(email);
CREATE INDEX idx_consultation_requests_assigned_to ON consultation_requests(assigned_to);
CREATE INDEX idx_contact_history_request_id ON contact_history(consultation_request_id);
CREATE INDEX idx_contact_history_customer_id ON contact_history(customer_id);
CREATE INDEX idx_customers_customer_code ON customers(customer_code);
CREATE INDEX idx_customers_assigned_manager ON customers(assigned_manager);
CREATE INDEX idx_projects_project_number ON projects(project_number);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_quotations_quotation_number ON quotations(quotation_number);
CREATE INDEX idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_site_visits_visit_date ON site_visits(visit_date);
CREATE INDEX idx_site_visits_customer_id ON site_visits(customer_id);
CREATE INDEX idx_progress_updates_project_id ON progress_updates(project_id);
CREATE INDEX idx_amc_contracts_contract_number ON amc_contracts(contract_number);
CREATE INDEX idx_amc_contracts_customer_id ON amc_contracts(customer_id);
CREATE INDEX idx_notifications_employee_id ON notifications(employee_id);
CREATE INDEX idx_documents_related ON documents(related_type, related_id);

-- ===========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ===========================================

-- Create triggers to automatically update timestamps
CREATE TRIGGER update_consultation_requests_updated_at 
  BEFORE UPDATE ON consultation_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_visits_updated_at 
  BEFORE UPDATE ON site_visits 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at 
  BEFORE UPDATE ON quotations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_materials_updated_at 
  BEFORE UPDATE ON project_materials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amc_contracts_updated_at 
  BEFORE UPDATE ON amc_contracts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE amc_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE amc_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- SECURITY POLICIES
-- ===========================================

-- Public access policies (for contact forms)
CREATE POLICY "Allow public insert on consultation_requests" ON consultation_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on consultation_requests" ON consultation_requests
  FOR SELECT USING (true);

CREATE POLICY "Allow public update on consultation_requests" ON consultation_requests
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users delete on consultation_requests" ON consultation_requests
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow public insert on contact_history" ON contact_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on contact_history" ON contact_history
  FOR SELECT USING (true);

-- Employee/Admin policies (authenticated users only)
CREATE POLICY "Allow authenticated users full access to employees" ON employees
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to customers" ON customers
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to site_visits" ON site_visits
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to quotations" ON quotations
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to quotation_items" ON quotation_items
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to projects" ON projects
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to project_assignments" ON project_assignments
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to project_materials" ON project_materials
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to installation_phases" ON installation_phases
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to progress_updates" ON progress_updates
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to quality_checks" ON quality_checks
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to project_completions" ON project_completions
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to invoices" ON invoices
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to invoice_items" ON invoice_items
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to payments" ON payments
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to amc_contracts" ON amc_contracts
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to amc_visits" ON amc_visits
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to notifications" ON notifications
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to system_settings" ON system_settings
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to documents" ON documents
  FOR ALL TO authenticated USING (true);

-- ===========================================
-- SAMPLE DATA INSERTION
-- ===========================================

-- Insert sample employees for testing
INSERT INTO employees (email, full_name, role, department) VALUES 
('admin@seaircon.com', 'System Administrator', 'admin', 'management'),
('sales@seaircon.com', 'Sales Manager', 'manager', 'sales'),
('tech@seaircon.com', 'Lead Technician', 'technician', 'technical'),
('operations@seaircon.com', 'Operations Manager', 'manager', 'operations'),
('accounts@seaircon.com', 'Accounts Manager', 'employee', 'accounts');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category) VALUES 
('company_name', 'SE Aircon Pvt Ltd', 'string', 'Company name for documents', 'company'),
('company_address', 'G-313, Sector 63, Noida, UP 201301', 'string', 'Company address', 'company'),
('company_phone', '+91 9311885464', 'string', 'Company phone number', 'company'),
('company_email', 'info@seaircon.com', 'string', 'Company email', 'company'),
('default_tax_rate', '18.00', 'number', 'Default GST rate', 'billing'),
('quotation_validity_days', '30', 'number', 'Default quotation validity', 'quotation'),
('invoice_payment_terms', '30 days from invoice date', 'string', 'Default payment terms', 'billing'),
('customer_code_prefix', 'SEA-CUS', 'string', 'Customer code prefix', 'numbering'),
('project_code_prefix', 'SEA-PRJ', 'string', 'Project code prefix', 'numbering'),
('quotation_code_prefix', 'SEA-QUO', 'string', 'Quotation code prefix', 'numbering'),
('invoice_code_prefix', 'SEA-INV', 'string', 'Invoice code prefix', 'numbering'),
('amc_code_prefix', 'SEA-AMC', 'string', 'AMC contract code prefix', 'numbering');

-- Insert sample consultation request for testing
INSERT INTO consultation_requests (
  name, email, phone, service_type, message, urgency_level, location, property_type
) VALUES 
(
  'John Doe', 
  'john@example.com', 
  '+91-9999999999', 
  'installation', 
  'Need new AC installation for 3BHK apartment', 
  'medium',
  'Sector 62, Noida',
  'residential'
),
(
  'Jane Smith', 
  'jane@company.com', 
  '+91-8888888888', 
  'maintenance', 
  'Annual maintenance for office ACs', 
  'low',
  'Connaught Place, Delhi',
  'commercial'
);

-- ===========================================
-- VERIFICATION AND COMPLETION
-- ===========================================

-- Verify the setup
SELECT 'SE Aircon CRM Database Schema Created Successfully!' as status;

-- Display table counts
SELECT 
  'consultation_requests' as table_name, COUNT(*) as record_count FROM consultation_requests
UNION ALL
SELECT 
  'employees' as table_name, COUNT(*) as record_count FROM employees
UNION ALL
SELECT 
  'system_settings' as table_name, COUNT(*) as record_count FROM system_settings;

-- Display created tables
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename AND table_schema = 'public') as column_count
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;

SELECT 'Setup complete! You can now create employees in Supabase Auth and start using the CRM system.' as final_message;