#!/bin/bash

# Form Migration Helper Script
# This script helps migrate from legacy form dialogs to the unified form system

echo "🚀 Starting Form Migration to Unified System..."

# Create backup directory
backup_dir="./migration_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

echo "📦 Creating backup in $backup_dir..."

# Backup existing components that will be modified
backup_files=(
    "src/app/admin/quotations/page.tsx"
    "src/app/admin/projects/page.tsx" 
    "src/app/admin/leads/page.tsx"
    "src/app/admin/employees/page.tsx"
    "src/app/admin/invoicing/page.tsx"
    "src/app/admin/payments/page.tsx"
    "src/app/admin/site-visits/page.tsx"
    "src/app/admin/installations/page.tsx"
    "src/app/admin/amc/page.tsx"
)

for file in "${backup_files[@]}"; do
    if [ -f "$file" ]; then
        mkdir -p "$backup_dir/$(dirname "$file")"
        cp "$file" "$backup_dir/$file"
        echo "✅ Backed up: $file"
    fi
done

echo ""
echo "🔧 Migration Status:"
echo ""

# Check which unified components exist
unified_components=(
    "src/components/admin/quotations/UnifiedQuotationsList.tsx"
    "src/components/admin/projects/UnifiedProjectsList.tsx"
    "src/components/admin/leads/UnifiedLeadsList.tsx"
    "src/components/admin/employees/UnifiedEmployeeList.tsx"
)

echo "✅ Existing Unified Components:"
for component in "${unified_components[@]}"; do
    if [ -f "$component" ]; then
        echo "   ✅ $(basename "$component")"
    else
        echo "   ❌ $(basename "$component") - MISSING"
    fi
done

echo ""
echo "🏗️  Components to Create:"
missing_components=(
    "src/components/admin/invoicing/UnifiedInvoicesList.tsx"
    "src/components/admin/payments/UnifiedPaymentsList.tsx"
    "src/components/admin/site-visits/UnifiedSiteVisitsList.tsx"
    "src/components/admin/installations/UnifiedInstallationsList.tsx"
    "src/components/admin/amc/UnifiedAMCList.tsx"
)

for component in "${missing_components[@]}"; do
    echo "   📝 $(basename "$component")"
done

echo ""
echo "📋 Migration Checklist:"
echo ""
echo "1. ✅ Unified form system infrastructure completed"
echo "2. ✅ Core unified components created (Quotations, Projects, Leads, Employees)"
echo "3. ⏳ Create remaining unified components (Invoices, Payments, Site Visits, Installations, AMC)"
echo "4. ⏳ Update page imports to use unified components"
echo "5. ⏳ Test all CRUD operations"
echo "6. ⏳ Remove legacy form dialogs"
echo "7. ⏳ Update documentation"

echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Create the missing unified components using the pattern from UnifiedQuotationsList.tsx"
echo "2. Update admin pages to import and use the unified components"
echo "3. Test each module's create, read, update functionality"
echo "4. Remove legacy components after successful testing"

echo ""
echo "💡 Example Page Update:"
echo ""
echo "// Before (in /src/app/admin/quotations/page.tsx):"
echo "import QuotationsList from '@/components/admin/quotations/QuotationsList'"
echo ""
echo "// After:"
echo "import UnifiedQuotationsList from '@/components/admin/quotations/UnifiedQuotationsList'"
echo ""
echo "// Then update the component usage in the return statement"

echo ""
echo "📖 See docs/FORM_MIGRATION_PROGRESS.md for detailed migration guide"
echo ""
echo "🔙 Backup created in: $backup_dir"
echo "✨ Migration preparation complete!"
