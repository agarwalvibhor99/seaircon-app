#!/bin/bash

# Cleanup script for the SE Aircon CRM app
# This script removes log files, build artifacts, and other temporary files

echo "🧹 Cleaning up the project..."

# Remove log files
find . -name "*.log" -type f -delete
echo "✅ Removed log files"

# Remove .next directory (build artifacts)
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ Removed .next build directory"
fi

# Remove node_modules (optional, uncomment if needed)
# if [ -d "node_modules" ]; then
#   rm -rf node_modules
#   echo "✅ Removed node_modules"
# fi

# Remove any temporary files
find . -name "*.tmp" -type f -delete
find . -name "*.temp" -type f -delete
find . -name "*~" -type f -delete
echo "✅ Removed temporary files"

echo "🎉 Cleanup complete!"
