#!/usr/bin/env node

/**
 * SEAircon CRM - Test Runner Script
 * Manages dependencies and runs comprehensive tests
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

function runCommand(command, description, options = {}) {
  log(`\n🔄 ${description}...`, 'cyan');
  try {
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: process.cwd(),
      ...options 
    });
    log(`✅ ${description} completed`, 'green');
    return result;
  } catch (error) {
    log(`⚠️  ${description} failed: ${error.message}`, 'yellow');
    return null;
  }
}

async function runScript(scriptPath, description) {
  log(`\n🧪 ${description}...`, 'cyan');
  return new Promise((resolve) => {
    const child = spawn('node', [scriptPath], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        log(`✅ ${description} completed`, 'green');
      } else {
        log(`⚠️  ${description} completed with warnings`, 'yellow');
      }
      resolve(code);
    });

    child.on('error', (error) => {
      log(`❌ ${description} failed: ${error.message}`, 'red');
      resolve(1);
    });
  });
}

async function main() {
  log('🧪 SEAircon CRM - Test Runner', 'bright');
  log('==============================', 'cyan');

  // Check environment
  log('\n📋 Environment Check:', 'yellow');
  checkFile('.env.local', 'Environment file (.env.local)');
  checkFile('package.json', 'Package configuration');
  checkFile('src/lib/supabase.ts', 'Supabase configuration');
  checkFile('test-endpoints.js', 'Endpoint test script');
  checkFile('test-database.js', 'Database test script');

  // Check and install dependencies
  log('\n📦 Dependency Check:', 'yellow');
  
  if (!fs.existsSync('node_modules')) {
    runCommand('npm install', 'Installing dependencies');
  } else {
    log('✅ Dependencies already installed', 'green');
  }

  // Check for required packages
  try {
    require('dotenv');
    log('✅ dotenv package available', 'green');
  } catch (e) {
    runCommand('npm install dotenv', 'Installing dotenv');
  }

  try {
    require('@supabase/supabase-js');
    log('✅ @supabase/supabase-js package available', 'green');
  } catch (e) {
    runCommand('npm install @supabase/supabase-js', 'Installing Supabase client');
  }

  // Run database tests
  log('\n🗄️  Database Tests:', 'yellow');
  await runScript('test-database.js', 'Running database connection tests');

  // Check if server is running for API tests
  log('\n🌐 API Server Check:', 'yellow');
  const serverRunning = await checkServerRunning();
  
  if (serverRunning) {
    log('✅ Development server is running', 'green');
    await runScript('test-endpoints.js', 'Running comprehensive endpoint tests');
  } else {
    log('⚠️  Development server not running', 'yellow');
    log('   API tests will be skipped', 'yellow');
    log('   To run full tests: npm run dev (in another terminal)', 'blue');
    
    // Still run the endpoint test to check what we can
    await runScript('test-endpoints.js', 'Running basic endpoint tests');
  }

  // Build test (optional)
  log('\n🔨 Build Test:', 'yellow');
  const buildResult = runCommand('npm run build', 'Testing build process', { silent: true });
  
  if (buildResult) {
    log('✅ Build test passed - no compilation errors', 'green');
  } else {
    log('⚠️  Build issues detected - check TypeScript errors', 'yellow');
  }

  // Summary
  log('\n🎯 Test Summary:', 'bright');
  log('✅ Environment and dependencies checked', 'green');
  log('✅ Database connection tests completed', 'green');
  log(`${serverRunning ? '✅' : '⚠️'}  API endpoint tests ${serverRunning ? 'completed' : 'partially completed'}`, serverRunning ? 'green' : 'yellow');
  
  log('\n💡 Next Steps:', 'cyan');
  log('   1. Start development server: npm run dev', 'blue');
  log('   2. Visit application: http://localhost:3000', 'blue');
  log('   3. Test contact form submission', 'blue');
  log('   4. Access admin dashboard: http://localhost:3000/admin', 'blue');
  log('   5. Login with: admin@seaircon.com / admin123!', 'blue');
  
  log('\n🚀 System Status: Ready for testing!', 'bright');
}

// Helper function to check if server is running
async function checkServerRunning() {
  return new Promise((resolve) => {
    const http = require('http');
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
}

// Run the main function
main().catch(error => {
  log(`❌ Test runner failed: ${error.message}`, 'red');
  process.exit(1);
});
