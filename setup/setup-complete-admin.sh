#!/bin/bash

echo "🔐 SE Aircon Admin Login - Complete Setup & Test"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the seaircon-app directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "🔍 Checking dependencies..."
if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm found"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check environment variables
echo ""
echo "🔧 Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Check if Supabase URL is set
if grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env.local; then
    echo "✅ Supabase URL configured"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
fi

# Check if Supabase anon key is set
if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local; then
    echo "✅ Supabase anon key configured"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local"
fi

echo ""
echo "🎯 What you need to do manually:"
echo ""
echo "1️⃣ CREATE EMPLOYEE RECORD"
echo "   → Go to Supabase Dashboard → SQL Editor"
echo "   → Run: setup-admin-employee.sql"
echo ""
echo "2️⃣ CREATE AUTH USER"
echo "   → Go to Authentication → Users"
echo "   → Add user: admin@seaircon.com / admin123!"
echo "   → ✅ Check 'Auto Confirm User'"
echo ""
echo "3️⃣ TEST LOGIN"
echo "   → Start server: npm run dev"
echo "   → Visit: http://localhost:3000/admin/login"
echo "   → Login with: admin@seaircon.com / admin123!"
echo ""

# Offer to run diagnostic
echo "🔍 Run diagnostic now? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "Running diagnostic..."
    node diagnose-login.js
fi

echo ""
echo "📚 Documentation files created:"
echo "   → FIX_INVALID_CREDENTIALS.md (Step-by-step guide)"
echo "   → setup-admin-employee.sql (Database setup)"
echo "   → diagnose-login.js (Diagnostic tool)"
echo ""
echo "🚀 Ready to start development server? Run: npm run dev"
