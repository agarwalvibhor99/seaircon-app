#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Updating Supabase imports from deprecated @supabase/auth-helpers-nextjs to @supabase/ssr...');

// Get all TypeScript and JavaScript files
const files = execSync('find src -name "*.ts" -o -name "*.tsx" | grep -v node_modules', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(file => file.length > 0);

let updatedCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Skip if file doesn't contain the deprecated import
    if (!content.includes('@supabase/auth-helpers-nextjs')) {
      return;
    }

    console.log(`📝 Updating ${filePath}...`);

    // Replace client component imports
    if (content.includes('createClientComponentClient')) {
      content = content.replace(
        /import\s*{\s*createClientComponentClient\s*}\s*from\s*['"]@supabase\/auth-helpers-nextjs['"]/g,
        "import { createBrowserClient } from '@supabase/ssr'"
      );
      content = content.replace(
        /const\s+(\w+)\s*=\s*createClientComponentClient\(\)/g,
        `const $1 = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )`
      );
      hasChanges = true;
    }

    // Replace server component imports
    if (content.includes('createServerComponentClient')) {
      content = content.replace(
        /import\s*{\s*createServerComponentClient\s*}\s*from\s*['"]@supabase\/auth-helpers-nextjs['"]/g,
        "import { createServerClient } from '@supabase/ssr'"
      );
      // Add cookies import if not present
      if (!content.includes("import { cookies }")) {
        content = content.replace(
          "import { createServerClient } from '@supabase/ssr'",
          "import { createServerClient } from '@supabase/ssr'\nimport { cookies } from 'next/headers'"
        );
      }
      content = content.replace(
        /const\s+(\w+)\s*=\s*createServerComponentClient\(\{\s*cookies\s*\}\)/g,
        `const cookieStore = await cookies()
  const $1 = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  )`
      );
      hasChanges = true;
    }

    // Replace route handler imports
    if (content.includes('createRouteHandlerClient')) {
      content = content.replace(
        /import\s*{\s*createRouteHandlerClient\s*}\s*from\s*['"]@supabase\/auth-helpers-nextjs['"]/g,
        "import { createServerClient } from '@supabase/ssr'"
      );
      // Add cookies import if not present
      if (!content.includes("import { cookies }")) {
        content = content.replace(
          "import { createServerClient } from '@supabase/ssr'",
          "import { createServerClient } from '@supabase/ssr'\nimport { cookies } from 'next/headers'"
        );
      }
      content = content.replace(
        /const\s+(\w+)\s*=\s*createRouteHandlerClient\(\{\s*cookies\s*\}\)/g,
        `const cookieStore = await cookies()
  const $1 = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  )`
      );
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      updatedCount++;
      console.log(`✅ Updated ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Updated ${updatedCount} files successfully!`);
console.log('⚠️  Note: You may need to manually adjust some complex cases or add missing imports.');
