-- Update consultation_requests status constraint for proper CRM workflow
-- This allows for a complete sales funnel: new → contacted → qualified → proposal_sent → won/lost

-- Drop existing constraint
ALTER TABLE consultation_requests 
DROP CONSTRAINT IF EXISTS consultation_requests_status_check;

-- Add new constraint with proper CRM statuses
ALTER TABLE consultation_requests 
ADD CONSTRAINT consultation_requests_status_check 
CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'cancelled'));

-- Add comment explaining the workflow
COMMENT ON COLUMN consultation_requests.status IS 'Lead status workflow: new → contacted → qualified → proposal_sent → won/lost. Won leads should be converted to projects.';
