# 🔐 Fix "Invalid Credentials" - Step by Step Guide

## Issue: "Invalid credentials" when trying to login to admin

This happens because the admin user doesn't exist in Supabase Auth or the employee record is missing.

## 🛠️ Solution Steps

### Step 1: Create Employee Record in Database

1. **Go to your Supabase dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your Project → SQL Editor
3. **Run this SQL**:

```sql
-- Insert admin employee record
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
```

4. **Verify**: Run `SELECT * FROM employees WHERE email = 'admin@seaircon.com';`

### Step 2: Create Auth User in Supabase

1. **Go to**: Authentication → Users in your Supabase dashboard
2. **Click**: "Add user" or "Create new user"
3. **Enter**:
   - Email: `admin@seaircon.com`
   - Password: `admin123!`
   - ✅ Check "Auto Confirm User" (important!)
4. **Click**: "Create user"

### Step 3: Test the Login

1. **Start your dev server**:
   ```bash
   cd /Users/vibhoragarwal/Developer/seaircon/seaircon-app
   npm run dev
   ```

2. **Go to**: http://localhost:3000/admin/login

3. **Login with**:
   - Email: `admin@seaircon.com`
   - Password: `admin123!`

### Step 4: Alternative - Quick Auth User Creation via SQL

If the UI method doesn't work, you can create the auth user via SQL:

```sql
-- This creates an auth user directly (use in SQL Editor)
SELECT auth.users_create_user(
  'admin@seaircon.com',
  'admin123!',
  true  -- email_confirmed
);
```

## 🔍 Debugging

If still having issues, run the diagnostic:

```bash
cd /Users/vibhoragarwal/Developer/seaircon/seaircon-app
node diagnose-login.js
```

## 🎯 Common Issues & Solutions

### Issue: "User already exists"
- **Solution**: Go to Auth → Users in Supabase dashboard and reset the password

### Issue: "Email not confirmed"
- **Solution**: In Supabase Auth dashboard, find the user and mark email as confirmed

### Issue: "Employee not found"
- **Solution**: Run the SQL from Step 1 above

### Issue: "Invalid login credentials"
- **Solution**: Double-check the password in Supabase Auth dashboard

## ✅ Expected Result

After following these steps:
- ✅ Admin user exists in Supabase Auth
- ✅ Employee record exists in database
- ✅ Login at `/admin/login` works
- ✅ Redirects to `/admin/dashboard` after login

## 🆘 Still Not Working?

1. **Check Supabase URL & Keys** in `.env.local`
2. **Verify database schema** is properly set up
3. **Check browser console** for any JavaScript errors
4. **Verify middleware** is not blocking the request

The most common cause is missing the "Auto Confirm User" checkbox when creating the auth user in Supabase dashboard.
