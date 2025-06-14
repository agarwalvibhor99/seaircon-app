#!/bin/bash

echo "🚀 Starting SE Aircon CRM Development Server..."
echo ""

# Change to project directory
cd /Users/vibhoragarwal/Developer/seaircon/seaircon-app

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting Next.js development server..."
echo "📍 Admin Login: http://localhost:3000/admin/login"
echo "📍 Homepage: http://localhost:3000"
echo ""
echo "🔑 Admin Credentials:"
echo "   Email: admin@seaircon.com"
echo "   Password: admin123!"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
