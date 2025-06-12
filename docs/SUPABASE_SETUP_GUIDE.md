# 🗄️ Supabase Database Setup Guide for Contact Forms

## 📋 Overview
This guide will help you set up your Supabase database to properly record all contact form submissions from your SEAircon website.

## 🚀 Step-by-Step Setup

### Step 1: Access Your Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your project: **auvgmprjwtyurxswsvwg**
4. Navigate to the **SQL Editor** in the left sidebar

### Step 2: Create Database Tables
Copy and paste the following SQL schema into your Supabase SQL Editor:

```sql
-- SEAircon CRM Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create consultation_requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
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
  assigned_to VARCHAR(255),
  estimated_value DECIMAL(10,2),
  follow_up_date TIMESTAMP,
  source VARCHAR(50) DEFAULT 'website',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create contact_history table
CREATE TABLE IF NOT EXISTS contact_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_request_id UUID REFERENCES consultation_requests(id) ON DELETE CASCADE,
  contact_type VARCHAR(50) NOT NULL,
  contact_date TIMESTAMP DEFAULT NOW(),
  summary TEXT,
  next_action VARCHAR(255),
  contacted_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON consultation_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_email ON consultation_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_history_request_id ON contact_history(consultation_request_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update timestamps
CREATE OR REPLACE TRIGGER update_consultation_requests_updated_at
  BEFORE UPDATE ON consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Execute the SQL
1. Paste the SQL code above into the SQL Editor
2. Click **Run** to execute the schema
3. You should see "Success. No rows returned" message

### Step 4: Verify Tables Created
1. Go to **Table Editor** in the left sidebar
2. You should see two tables:
   - `consultation_requests` - Main table for form submissions
   - `contact_history` - Table for tracking follow-ups

### Step 5: Set Up Row Level Security (RLS)
For production security, add these policies:

```sql
-- Enable Row Level Security
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_history ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert contact forms
CREATE POLICY "Allow anonymous inserts on consultation_requests" ON consultation_requests
  FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users to read all records
CREATE POLICY "Allow authenticated reads on consultation_requests" ON consultation_requests
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update records
CREATE POLICY "Allow authenticated updates on consultation_requests" ON consultation_requests
  FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users full access to contact_history
CREATE POLICY "Allow authenticated access to contact_history" ON contact_history
  FOR ALL TO authenticated USING (true);
```

## 📊 Database Schema Details

### `consultation_requests` Table
This is the main table that stores all contact form submissions:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier (auto-generated) |
| `name` | VARCHAR(255) | Customer's full name |
| `email` | VARCHAR(255) | Customer's email address |
| `phone` | VARCHAR(20) | Customer's phone number |
| `company` | VARCHAR(255) | Company name (optional) |
| `service_type` | VARCHAR(100) | Type of service requested |
| `message` | TEXT | Customer's message/requirements |
| `urgency_level` | VARCHAR(20) | Priority level (low/medium/high/emergency) |
| `preferred_contact_method` | VARCHAR(20) | How customer prefers to be contacted |
| `preferred_contact_time` | VARCHAR(50) | When customer prefers to be contacted |
| `status` | VARCHAR(20) | Request status (new/contacted/in_progress/completed/cancelled) |
| `assigned_to` | VARCHAR(255) | Staff member assigned to handle request |
| `estimated_value` | DECIMAL(10,2) | Estimated project value |
| `follow_up_date` | TIMESTAMP | When to follow up |
| `source` | VARCHAR(50) | Where the request came from (website/phone/email) |
| `notes` | TEXT | Internal notes about the request |
| `created_at` | TIMESTAMP | When record was created |
| `updated_at` | TIMESTAMP | When record was last updated |

### `contact_history` Table
This table tracks all interactions with customers:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `consultation_request_id` | UUID | Links to consultation_requests table |
| `contact_type` | VARCHAR(50) | Type of contact (call/email/meeting/etc.) |
| `contact_date` | TIMESTAMP | When contact was made |
| `summary` | TEXT | Summary of the interaction |
| `next_action` | VARCHAR(255) | What needs to be done next |
| `contacted_by` | VARCHAR(255) | Staff member who made contact |
| `created_at` | TIMESTAMP | When record was created |

## 🔧 Environment Configuration

Your environment variables are already set up in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://auvgmprjwtyurxswsvwg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Testing the Setup

### Option 1: Use the Debug Script
```bash
cd /Users/vibhoragarwal/Developer/seaircon/seaircon-app
node debug-form.js
```

### Option 2: Test Via Web Interface
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Open http://localhost:3000
3. Fill out and submit the contact form
4. Check your Supabase dashboard → Table Editor → consultation_requests

## 📈 Viewing Your Data

### In Supabase Dashboard:
1. Go to **Table Editor**
2. Click on `consultation_requests` table
3. View all form submissions with filters and search

### Sample Queries:
```sql
-- View all recent submissions
SELECT * FROM consultation_requests 
ORDER BY created_at DESC 
LIMIT 10;

-- View high priority requests
SELECT * FROM consultation_requests 
WHERE urgency_level IN ('high', 'emergency') 
AND status = 'new';

-- View submissions by service type
SELECT service_type, COUNT(*) as count 
FROM consultation_requests 
GROUP BY service_type;
```

## 🔐 Security Features

1. **Row Level Security (RLS)** enabled
2. **Anonymous insert policy** for contact forms
3. **Authenticated-only access** for admin functions
4. **Environment variable protection** for API keys

## 🎯 What This Enables

With this setup, your contact form will:
- ✅ Store all submissions in Supabase
- ✅ Track customer interactions
- ✅ Enable admin dashboard functionality
- ✅ Provide analytics and reporting
- ✅ Support follow-up workflows
- ✅ Maintain audit trails

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Supabase project URL and keys
3. Ensure RLS policies are correctly set
4. Check Supabase logs in the dashboard

Your database is now ready to record all contact form submissions! 🎉
