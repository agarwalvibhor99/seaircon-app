-- Enhanced CRM Schema Migration
-- Phase 1 & 2: Project-Centric Structure with Quote Versioning

-- ==================== ENHANCE EXISTING TABLES ====================

-- 1. Enhance Projects Table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS project_type TEXT CHECK (project_type IN ('installation', 'maintenance', 'repair', 'amc', 'consultation', 'other')) DEFAULT 'installation',
ADD COLUMN IF NOT EXISTS project_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS actual_completion DATE,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update projects status enum to include more states
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_status_check,
ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'planning', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled'));

-- 2. Enhance Customers Table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS customer_type TEXT CHECK (customer_type IN ('individual', 'business', 'government')) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Enhance Invoices Table for Quote Relationship
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS invoice_type TEXT CHECK (invoice_type IN ('quote', 'proforma', 'invoice', 'credit_note')) DEFAULT 'invoice',
ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotations(id),
ADD COLUMN IF NOT EXISTS quote_version TEXT,
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sent_date DATE,
ADD COLUMN IF NOT EXISTS paid_date DATE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update invoices status to include more states
ALTER TABLE invoices 
DROP CONSTRAINT IF EXISTS invoices_status_check,
ADD CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'partial'));

-- 4. Enhance Payments Table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id),
ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotations(id),
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('completed', 'pending', 'failed', 'refunded')) DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS receipt_number TEXT,
ADD COLUMN IF NOT EXISTS bank_details TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Enhance Leads Table for Project Conversion
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS lead_source TEXT CHECK (lead_source IN ('website', 'referral', 'social_media', 'advertisement', 'cold_call', 'other')) DEFAULT 'website',
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS project_type TEXT,
ADD COLUMN IF NOT EXISTS timeline TEXT,
ADD COLUMN IF NOT EXISTS converted_to_project BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update leads status to include more workflow states
ALTER TABLE leads 
DROP CONSTRAINT IF EXISTS leads_status_check,
ADD CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'));

-- ==================== CREATE NEW TABLES ====================

-- 1. Quotations Table (Enhanced for Phase 2)
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT UNIQUE NOT NULL, -- Q001, Q002, etc.
    quote_title TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT 'v1', -- v1, v2, etc.
    
    -- Status workflow
    status TEXT CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected', 'expired', 'superseded')) DEFAULT 'draft',
    
    -- Relationships
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    created_by UUID REFERENCES employees(id),
    
    -- Financial
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 18.00,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Dates
    issue_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    sent_date DATE,
    approved_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Content
    description TEXT,
    scope_of_work TEXT,
    terms_and_conditions TEXT,
    notes TEXT
);

-- Create quote numbering sequence
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;

-- 2. Quotation Items Table
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'piece',
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    category TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Invoice Items Table (if not exists)
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'piece',
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    category TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Project Activity Log Table (Phase 2)
CREATE TABLE IF NOT EXISTS project_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'quote_created', 'quote_sent', 'quote_approved', 'quote_rejected',
        'invoice_created', 'invoice_sent', 'payment_received', 'status_changed',
        'project_created', 'project_updated', 'note_added', 'file_uploaded'
    )),
    title TEXT NOT NULL,
    description TEXT,
    
    -- Related entities
    related_entity_type TEXT CHECK (related_entity_type IN ('quotation', 'invoice', 'payment', 'customer')),
    related_entity_id UUID,
    
    -- User and timing
    performed_by UUID REFERENCES employees(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional data
    metadata JSONB
);

-- ==================== CREATE INDEXES ====================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at);

-- Quotations indexes
CREATE INDEX IF NOT EXISTS idx_quotations_project ON quotations(project_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotations_created ON quotations(created_at);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_quote ON invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(invoice_type);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_quote ON payments(quote_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activities_project ON project_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON project_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_performed ON project_activities(performed_at);

-- ==================== CREATE TRIGGERS ====================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
        NEW.quote_number := 'Q' || LPAD(nextval('quote_number_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_generate_quote_number ON quotations;
CREATE TRIGGER trigger_generate_quote_number BEFORE INSERT ON quotations FOR EACH ROW EXECUTE FUNCTION generate_quote_number();

-- Auto-log project activities
CREATE OR REPLACE FUNCTION log_project_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log project creation
    IF TG_OP = 'INSERT' THEN
        INSERT INTO project_activities (project_id, activity_type, title, performed_by)
        VALUES (NEW.id, 'project_created', 'Project "' || NEW.project_name || '" created', NEW.created_by);
        RETURN NEW;
    END IF;
    
    -- Log status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO project_activities (project_id, activity_type, title, description, performed_by)
        VALUES (NEW.id, 'status_changed', 'Project status changed', 
                'Status changed from "' || OLD.status || '" to "' || NEW.status || '"', NEW.project_manager_id);
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_log_project_activity ON projects;
CREATE TRIGGER trigger_log_project_activity AFTER INSERT OR UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION log_project_activity();

-- ==================== CREATE VIEWS ====================

-- Project summary view
CREATE OR REPLACE VIEW project_summary AS
SELECT 
    p.*,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    e.full_name as project_manager_name,
    COUNT(DISTINCT q.id) as quote_count,
    COUNT(DISTINCT i.id) as invoice_count,
    COUNT(DISTINCT pay.id) as payment_count,
    COALESCE(SUM(pay.amount), 0) as total_received,
    COALESCE(SUM(i.total_amount), 0) as total_invoiced,
    COALESCE(SUM(q.total_amount), 0) as total_quoted
FROM projects p
LEFT JOIN customers c ON p.customer_id = c.id
LEFT JOIN employees e ON p.project_manager_id = e.id
LEFT JOIN quotations q ON p.id = q.project_id
LEFT JOIN invoices i ON p.id = i.project_id
LEFT JOIN payments pay ON p.id = pay.project_id
GROUP BY p.id, c.name, c.email, c.phone, e.full_name;

-- Quote workflow view
CREATE OR REPLACE VIEW quote_workflow AS
SELECT 
    q.*,
    p.project_name,
    p.project_number,
    c.name as customer_name,
    e.full_name as created_by_name,
    COUNT(qi.id) as item_count,
    CASE 
        WHEN q.status = 'approved' AND EXISTS(SELECT 1 FROM invoices WHERE quote_id = q.id) THEN 'converted'
        ELSE q.status 
    END as workflow_status
FROM quotations q
LEFT JOIN projects p ON q.project_id = p.id
LEFT JOIN customers c ON q.customer_id = c.id
LEFT JOIN employees e ON q.created_by = e.id
LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
GROUP BY q.id, p.project_name, p.project_number, c.name, e.full_name;

-- Financial summary view
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    'quotes' as entity_type,
    COUNT(*) as total_count,
    SUM(total_amount) as total_value,
    SUM(CASE WHEN status = 'approved' THEN total_amount ELSE 0 END) as approved_value,
    SUM(CASE WHEN status = 'sent' THEN total_amount ELSE 0 END) as pending_value
FROM quotations
UNION ALL
SELECT 
    'invoices' as entity_type,
    COUNT(*) as total_count,
    SUM(total_amount) as total_value,
    SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_value,
    SUM(CASE WHEN status IN ('sent', 'overdue') THEN balance_due ELSE 0 END) as outstanding_value
FROM invoices
UNION ALL
SELECT 
    'payments' as entity_type,
    COUNT(*) as total_count,
    SUM(amount) as total_value,
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_value,
    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_value
FROM payments;

-- ==================== SAMPLE DATA MIGRATION ====================

-- Update existing projects with enhanced fields
UPDATE projects SET 
    project_type = 'installation',
    estimated_value = COALESCE(budget, 0),
    updated_at = NOW()
WHERE project_type IS NULL;

-- Update existing invoices with balance calculations
UPDATE invoices SET 
    balance_due = total_amount - COALESCE(amount_paid, 0),
    updated_at = NOW()
WHERE balance_due IS NULL;

-- Update existing customers with default type
UPDATE customers SET 
    customer_type = 'individual',
    updated_at = NOW()
WHERE customer_type IS NULL;

-- ==================== PERMISSIONS & SECURITY ====================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- RLS Policies (if using Row Level Security)
-- ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view quotations" ON quotations FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Users can insert quotations" ON quotations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Users can update quotations" ON quotations FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Users can delete quotations" ON quotations FOR DELETE USING (auth.role() = 'authenticated');

COMMIT;
