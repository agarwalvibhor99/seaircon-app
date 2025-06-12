# Troubleshooting Guide

## Common Issues and Solutions

### 1. Module Not Found Errors

If you see errors like "Cannot find module '@supabase/supabase-js'":

```bash
# Solution: Install dependencies
npm install

# If that doesn't work, try clearing cache and reinstalling
rm -rf node_modules package-lock.json
npm install
```

### 2. TypeScript Errors

**Error**: Type errors in components or services

**Solution**: Check that all dependencies are installed and types are correct:
```bash
npm install
npm run build
```

### 3. Supabase Connection Issues

**Error**: "Missing Supabase environment variables"

**Solution**: 
1. Ensure `.env.local` exists and has correct values
2. Get credentials from Supabase dashboard (Settings > API)
3. Restart development server after updating env vars

### 4. Build Failures

**Error**: Build fails with TypeScript errors

**Solution**:
1. Check that all imports are correct
2. Ensure all dependencies are installed
3. Run `npm run lint` to check for code issues

### 5. Development Server Won't Start

**Error**: Port 3000 is already in use

**Solution**:
```bash
# Kill any process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### 6. Database Connection Issues

**Error**: Supabase queries fail

**Solution**:
1. Check Supabase project is active
2. Verify API keys are correct
3. Ensure database tables exist (run SQL from CRM_README.md)
4. Check Row Level Security policies

### 7. UI Components Not Displaying

**Error**: Components render but look unstyled

**Solution**:
1. Ensure Tailwind CSS is properly configured
2. Check if all UI components exist in `src/components/ui/`
3. Verify imports are correct

## Quick Fixes

### Reset Everything
```bash
# Clean install
rm -rf node_modules package-lock.json .next
npm install

# Reset database (if needed)
# Go to Supabase dashboard > SQL Editor > Run the schema from CRM_README.md
```

### Check Environment
```bash
# Verify Node.js version (should be 18+)
node -v

# Check if all files exist
ls -la src/lib/
ls -la src/components/
ls -la .env.local
```

### Test Build
```bash
# Test if everything builds correctly
npm run build

# If build passes, start dev server
npm run dev
```

## Getting Help

1. Check the console for specific error messages
2. Verify all environment variables are set
3. Ensure Supabase project is properly configured
4. Check that all dependencies are installed

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Check types
npx tsc --noEmit
```

## Contact

If you're still experiencing issues, please provide:
1. Exact error message
2. Steps to reproduce
3. Node.js version (`node -v`)
4. npm version (`npm -v`)
5. Operating system
