-- Quick setup for admin user
-- Run this in Supabase SQL Editor

-- 1. Insert admin employee record
INSERT INTO employees (email, full_name, role, department, phone, is_active) 
VALUES (
    'admin@seaircon.com', 
    'System Administrator', 
    'admin', 
    'management',
    '+91 9311885464',
    true
) 
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    phone = EXCLUDED.phone,
    is_active = EXCLUDED.is_active;

-- 2. Verify the record was created
SELECT * FROM employees WHERE email = 'admin@seaircon.com';

-- Expected output should show the admin user record
