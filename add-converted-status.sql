-- Enable lead status-based management instead of deletion
-- This provides a complete audit trail and business intelligence capability

-- Update the status constraint to include 'converted'
ALTER TABLE consultation_requests 
DROP CONSTRAINT IF EXISTS consultation_requests_status_check;

ALTER TABLE consultation_requests 
ADD CONSTRAINT consultation_requests_status_check 
CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'cancelled', 'converted'));

-- Add conversion tracking columns
ALTER TABLE consultation_requests 
ADD COLUMN IF NOT EXISTS converted_to_project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE consultation_requests 
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP DEFAULT NULL;

-- Create performance indexes for filtering
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status 
ON consultation_requests(status);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_converted 
ON consultation_requests(converted_to_project_id) WHERE converted_to_project_id IS NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN consultation_requests.status IS 'Lead status: new, contacted, in_progress, completed, cancelled, converted';
COMMENT ON COLUMN consultation_requests.converted_to_project_id IS 'Project ID if this lead was converted to a project';
COMMENT ON COLUMN consultation_requests.converted_at IS 'Timestamp when the lead was converted to a project';

-- Create a view for easy active leads access
CREATE OR REPLACE VIEW active_leads AS
SELECT * FROM consultation_requests 
WHERE status IN ('new', 'contacted', 'in_progress');

-- Create a view for converted leads with project info
CREATE OR REPLACE VIEW converted_leads_with_projects AS
SELECT 
  cr.*,
  p.project_number,
  p.project_name,
  p.project_value,
  p.status as project_status
FROM consultation_requests cr
JOIN projects p ON cr.converted_to_project_id = p.id
WHERE cr.status = 'converted';
