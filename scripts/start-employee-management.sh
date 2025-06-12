#!/bin/bash

# 🚀 SE Aircon Employee Management - Quick Start Script
# This script helps you quickly test the employee management system

echo "🏢 SE Aircon CRM - Employee Management Quick Start"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Environment file not found!"
    echo "Please create .env.local with your Supabase credentials:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo ""
    echo "Get these from: https://supabase.com/dashboard"
    exit 1
fi

echo "✅ Environment setup complete"
echo ""

# Start the development server
echo "🚀 Starting development server..."
echo "Navigate to: http://localhost:3000"
echo ""
echo "📋 Employee Management Access:"
echo "1. Login URL: http://localhost:3000/admin/login"
echo "2. Credentials: admin@seaircon.com / admin123!"
echo "3. Employee Management: http://localhost:3000/admin/employees"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Next.js development server
npm run dev
