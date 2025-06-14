-- Lead Status Management Enhancements
-- Add status change history tracking for consultation requests

-- Create lead status history table
CREATE TABLE IF NOT EXISTS consultation_request_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_request_id UUID NOT NULL REFERENCES consultation_requests(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    change_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultation_status_history_request_id 
ON consultation_request_status_history(consultation_request_id);

CREATE INDEX IF NOT EXISTS idx_consultation_status_history_created_at 
ON consultation_request_status_history(created_at);

-- Add RLS policies for status history
ALTER TABLE consultation_request_status_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read status history
CREATE POLICY "consultation_status_history_read" ON consultation_request_status_history
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert status history
CREATE POLICY "consultation_status_history_insert" ON consultation_request_status_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create function to automatically track status changes
CREATE OR REPLACE FUNCTION track_consultation_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only track if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO consultation_request_status_history (
            consultation_request_id,
            previous_status,
            new_status,
            changed_by,
            change_reason
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            auth.uid(),
            'Status updated via CRM system'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically track status changes
DROP TRIGGER IF EXISTS track_consultation_status_change_trigger ON consultation_requests;
CREATE TRIGGER track_consultation_status_change_trigger
    AFTER UPDATE ON consultation_requests
    FOR EACH ROW
    EXECUTE FUNCTION track_consultation_status_change();

-- Grant permissions
GRANT ALL ON consultation_request_status_history TO authenticated;
GRANT USAGE ON SEQUENCE consultation_request_status_history_id_seq TO authenticated;

-- Create RPC function to get lead status history
CREATE OR REPLACE FUNCTION get_lead_status_history(lead_id UUID)
RETURNS TABLE (
    id UUID,
    consultation_request_id UUID,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by UUID,
    change_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.consultation_request_id,
        h.previous_status,
        h.new_status,
        h.changed_by,
        h.change_reason,
        h.notes,
        h.created_at
    FROM consultation_request_status_history h
    WHERE h.consultation_request_id = lead_id
    ORDER BY h.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to manually add status history entry
CREATE OR REPLACE FUNCTION add_status_history_entry(
    consultation_request_id UUID,
    previous_status VARCHAR(50) DEFAULT NULL,
    new_status VARCHAR(50),
    changed_by UUID DEFAULT NULL,
    change_reason TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO consultation_request_status_history (
        consultation_request_id,
        previous_status,
        new_status,
        changed_by,
        change_reason,
        notes
    ) VALUES (
        consultation_request_id,
        previous_status,
        new_status,
        COALESCE(changed_by, auth.uid()),
        change_reason,
        notes
    ) RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION get_lead_status_history TO authenticated;
GRANT EXECUTE ON FUNCTION add_status_history_entry TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE consultation_request_status_history IS 'Tracks all status changes for consultation requests with timestamps and user information';
COMMENT ON FUNCTION track_consultation_status_change() IS 'Automatically logs status changes when consultation_requests.status is updated';
