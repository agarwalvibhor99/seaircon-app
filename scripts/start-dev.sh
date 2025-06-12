#!/bin/bash

# Development Server Startup Script for SEAircon CRM
echo "🚀 Starting SEAircon CRM Development Server..."
echo "📁 Project Directory: $(pwd)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🏃 Starting Next.js development server..."
echo "🌐 The application will be available at: http://localhost:3000"
echo "🛠️  Admin dashboard will be at: http://localhost:3000/admin"
echo ""
echo "⚠️  Note: You need to set up Supabase environment variables in .env.local"
echo ""

npm run dev
