-- Add conversion tracking fields to consultation_requests table
-- This allows us to keep historical lead data for conversion analytics

-- Add column to track which project a lead was converted to
ALTER TABLE consultation_requests 
ADD COLUMN IF NOT EXISTS converted_to_project_id UUID REFERENCES projects(id);

-- Add timestamp when conversion happened
ALTER TABLE consultation_requests 
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_consultation_requests_converted_project 
ON consultation_requests(converted_to_project_id);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_converted_at 
ON consultation_requests(converted_at);

-- Add comments for documentation
COMMENT ON COLUMN consultation_requests.converted_to_project_id IS 'References the project this lead was converted to when status = won';
COMMENT ON COLUMN consultation_requests.converted_at IS 'Timestamp when the lead was converted to a project';

-- Create view for active leads (excludes won leads from regular lead management)
CREATE OR REPLACE VIEW active_consultation_requests AS
SELECT * FROM consultation_requests 
WHERE status NOT IN ('won', 'lost', 'cancelled')
ORDER BY created_at DESC;

-- Create view for conversion analytics
CREATE OR REPLACE VIEW lead_conversion_analytics AS
SELECT 
    id,
    name,
    email,
    phone,
    service_type,
    status,
    created_at,
    converted_at,
    converted_to_project_id,
    EXTRACT(DAYS FROM converted_at - created_at) as days_to_convert,
    CASE 
        WHEN status = 'won' THEN 'converted'
        WHEN status IN ('lost', 'cancelled') THEN 'closed_lost'
        ELSE 'active'
    END as lead_outcome
FROM consultation_requests
WHERE created_at >= NOW() - INTERVAL '1 year'; -- Last year's data

-- Add RLS policies for new columns
-- (Assumes existing RLS is enabled on consultation_requests table)

COMMENT ON VIEW active_consultation_requests IS 'Shows only active leads (excludes won/lost/cancelled for day-to-day lead management)';
COMMENT ON VIEW lead_conversion_analytics IS 'Provides conversion analytics data including time to convert and outcomes';
