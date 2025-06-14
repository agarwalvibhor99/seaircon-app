#!/bin/bash

# Script to update all toast imports to use the new single toast file

cd /Users/vibhoragarwal/Developer/seaircon/seaircon-app

# Find all TypeScript files with old toast imports and update them
find src -name "*.tsx" -type f -exec sed -i '' 's/import { showToast } from.*toast\.service.*/import { notify } from "@\/lib\/toast"/g' {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/import toast from.*toast\.service.*/import { notify } from "@\/lib\/toast"/g' {} \;

# Update usage patterns
find src -name "*.tsx" -type f -exec sed -i '' 's/showToast\.success/notify.success/g' {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/showToast\.error/notify.error/g' {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/toast\.success/notify.success/g' {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/toast\.error/notify.error/g' {} \;

echo "All toast imports updated to use single toast file!"
