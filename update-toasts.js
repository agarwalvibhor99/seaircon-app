#!/usr/bin/env node

// Script to update all old showToast usages to new modern toast system

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const srcDir = path.join(__dirname, 'src')

// Files to update
const filesToUpdate = [
  'src/components/admin/invoicing/CreateInvoiceForm.tsx',
  'src/components/admin/payments/CreatePaymentForm.tsx',
  'src/components/admin/quotations/CreateQuotationForm.tsx',
  'src/app/admin/leads/new/page.tsx',
  'src/components/admin/leads/LeadsList.tsx',
  'src/components/admin/leads/LeadsListSimple.tsx',
  'src/app/admin/leads/edit/[id]/page.tsx',
  'src/components/admin/leads/CreateLeadFormDialog.tsx',
  'src/components/admin/leads/LeadsListUnified.tsx',
  'src/components/admin/leads/LeadsListClean.tsx',
  'src/components/admin/quotations/CreateQuotationFormDialog.tsx',
  'src/components/admin/projects/CreateProjectFormDialog.tsx',
  'src/components/admin/invoicing/CreateInvoiceFormDialog.tsx',
  'src/components/admin/payments/CreatePaymentFormDialog.tsx',
  'src/components/admin/employees/CreateEmployeeFormDialog.tsx',
  'src/components/admin/site-visits/ScheduleSiteVisitFormDialog.tsx',
  'src/components/admin/installations/CreateInstallationFormDialog.tsx',
  'src/components/admin/amc/CreateAMCFormDialog.tsx',
  'src/components/ui/dynamic-form.tsx',
  'src/components/ui/unified-form-manager.tsx',
  'src/components/admin/employees/UnifiedEmployeeList.tsx',
  'src/components/admin/quotations/UnifiedQuotationsList.tsx',
  'src/components/admin/projects/UnifiedProjectsList.tsx',
  'src/components/admin/invoicing/UnifiedInvoicesList.tsx',
  'src/components/admin/payments/UnifiedPaymentsList.tsx',
  'src/components/admin/site-visits/UnifiedSiteVisitsList.tsx',
  'src/components/admin/installations/UnifiedInstallationsList.tsx',
  'src/components/admin/amc/UnifiedAMCList.tsx'
]

function updateFile(filePath) {
  const fullPath = path.join(__dirname, filePath)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`)
    return
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8')
    
    // Track if we made any changes
    let changed = false
    
    // Replace import statement
    if (content.includes("import { showToast } from '@/lib/toast.service'")) {
      content = content.replace(
        "import { showToast } from '@/lib/toast.service'",
        "import { notify } from '@/lib/notify'"
      )
      changed = true
    }
    
    // Replace showToast.success calls
    content = content.replace(/showToast\.success\(/g, 'notify.success(')
    content = content.replace(/showToast\.error\(/g, 'notify.error(')
    content = content.replace(/showToast\.warning\(/g, 'notify.warning(')
    content = content.replace(/showToast\.info\(/g, 'notify.info(')
    
    // Handle special case in edit lead page
    content = content.replace(/showToast\('([^']+)',\s*'success'\)/g, "notify.success('$1')")
    content = content.replace(/showToast\('([^']+)',\s*'error'\)/g, "notify.error('$1')")
    content = content.replace(/showToast\('([^']+)',\s*'warning'\)/g, "notify.warning('$1')")
    content = content.replace(/showToast\('([^']+)',\s*'info'\)/g, "notify.info('$1')")
    
    if (changed || content !== fs.readFileSync(fullPath, 'utf8')) {
      fs.writeFileSync(fullPath, content)
      console.log(`✅ Updated: ${filePath}`)
    } else {
      console.log(`🔄 No changes needed: ${filePath}`)
    }
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message)
  }
}

// Update all files
console.log('🚀 Starting modern toast migration...\n')

filesToUpdate.forEach(updateFile)

console.log('\n✨ Toast migration complete!')
console.log('\n🎨 All components now use the modern, sleek toast notification system!')
