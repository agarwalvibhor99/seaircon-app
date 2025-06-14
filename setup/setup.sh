#!/bin/bash

# SEAircon CRM Setup and Installation Script
echo "🏢 SEAircon CRM System Setup"
echo "=================================="
echo ""

# Check Node.js version
echo "📋 Checking system requirements..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check your internet connection and try again."
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Check environment variables
echo ""
echo "🔧 Checking environment setup..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Creating template..."
    cat > .env.local << EOF
# Supabase Configuration
# Replace these with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Example:
# NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# To get these values:
# 1. Go to https://supabase.com/dashboard
# 2. Create a new project or select existing
# 3. Go to Settings > API
# 4. Copy the Project URL and API Keys
EOF
    echo "📝 .env.local template created. Please update it with your Supabase credentials."
else
    echo "✅ .env.local file exists"
fi

# Build check
echo ""
echo "🔨 Running build check..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Final instructions
echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Set up Supabase database using the SQL in CRM_README.md"
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 Application URLs:"
echo "   Main site: http://localhost:3000"
echo "   Admin dashboard: http://localhost:3000/admin"
echo ""
echo "📚 See CRM_README.md for detailed documentation"
