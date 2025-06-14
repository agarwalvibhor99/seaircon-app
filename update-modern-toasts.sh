#!/bin/bash

# Update all files with modern toast system
echo "🚀 Updating all components to use modern toast notifications..."

# Files to update
FILES=(
  "src/components/admin/quotations/CreateQuotationForm.tsx"
  "src/app/admin/leads/new/page.tsx"
  "src/components/admin/leads/LeadsList.tsx"
  "src/components/admin/leads/LeadsListSimple.tsx"
  "src/app/admin/leads/edit/[id]/page.tsx"
  "src/components/admin/leads/CreateLeadFormDialog.tsx"
  "src/components/admin/leads/LeadsListUnified.tsx"
  "src/components/admin/leads/LeadsListClean.tsx"
  "src/components/admin/quotations/CreateQuotationFormDialog.tsx"
  "src/components/admin/projects/CreateProjectFormDialog.tsx"
  "src/components/admin/invoicing/CreateInvoiceFormDialog.tsx"
  "src/components/admin/payments/CreatePaymentFormDialog.tsx"
  "src/components/admin/employees/CreateEmployeeFormDialog.tsx"
  "src/components/admin/site-visits/ScheduleSiteVisitFormDialog.tsx"
  "src/components/admin/installations/CreateInstallationFormDialog.tsx"
  "src/components/admin/amc/CreateAMCFormDialog.tsx"
  "src/components/ui/dynamic-form.tsx"
  "src/components/ui/unified-form-manager.tsx"
  "src/components/admin/employees/UnifiedEmployeeList.tsx"
  "src/components/admin/quotations/UnifiedQuotationsList.tsx"
  "src/components/admin/projects/UnifiedProjectsList.tsx"
  "src/components/admin/invoicing/UnifiedInvoicesList.tsx"
  "src/components/admin/payments/UnifiedPaymentsList.tsx"
  "src/components/admin/site-visits/UnifiedSiteVisitsList.tsx"
  "src/components/admin/installations/UnifiedInstallationsList.tsx"
  "src/components/admin/amc/UnifiedAMCList.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Updating $file..."
    
    # Update import statement
    sed -i '' "s/import { showToast } from '@\/lib\/toast.service'/import { notify } from '@\/lib\/notify'/g" "$file"
    
    # Update function calls
    sed -i '' 's/showToast\.success(/notify.success(/g' "$file"
    sed -i '' 's/showToast\.error(/notify.error(/g' "$file"
    sed -i '' 's/showToast\.warning(/notify.warning(/g' "$file"
    sed -i '' 's/showToast\.info(/notify.info(/g' "$file"
    
    # Handle special case in edit lead page (function call style)
    sed -i '' "s/showToast(\([^,]*\), 'success')/notify.success(\1)/g" "$file"
    sed -i '' "s/showToast(\([^,]*\), 'error')/notify.error(\1)/g" "$file"
    sed -i '' "s/showToast(\([^,]*\), 'warning')/notify.warning(\1)/g" "$file"
    sed -i '' "s/showToast(\([^,]*\), 'info')/notify.info(\1)/g" "$file"
    
    echo "✅ Updated $file"
  else
    echo "⚠️ File not found: $file"
  fi
done

echo ""
echo "✨ All components updated to use modern, sleek toast notifications!"
echo "🎨 Features:"
echo "   • Glass-style design with backdrop blur"
echo "   • Smooth animations and transitions" 
echo "   • Rich descriptions and icons"
echo "   • Modern positioning and styling"
echo "   • Better accessibility and UX"
