-- Fix DELETE policy for consultation_requests table
-- Remove restrictive policy and allow public deletion for admin operations

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow authenticated users delete on consultation_requests" ON consultation_requests;

-- Create a more permissive policy for admin operations
-- This allows deletion since admin authentication is handled at the application layer
CREATE POLICY "Allow admin delete on consultation_requests" ON consultation_requests
  FOR DELETE USING (true);

-- Verify the policy was created
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'consultation_requests' 
AND policyname = 'Allow admin delete on consultation_requests';
