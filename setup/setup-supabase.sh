#!/bin/bash

# Supabase Database Setup and Test Script
echo "🗄️  SEAircon Supabase Database Setup"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if environment variables exist
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    echo "   Please create .env.local with your Supabase credentials"
    exit 1
fi

echo "✅ Environment file found"

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install @supabase/supabase-js dotenv

# Test database connection
echo "🔍 Testing database connection..."
node debug-form.js

echo ""
echo "📋 Next Steps:"
echo "1. Open your Supabase dashboard: https://auvgmprjwtyurxswsvwg.supabase.co"
echo "2. Go to SQL Editor"
echo "3. Run the SQL schema from: supabase-schema.sql"
echo "4. Test your contact form at: http://localhost:3000"
echo ""
echo "🚀 Start development server with: npm run dev"
