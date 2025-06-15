# SE Aircon CRM - Unified System Architecture

## Overview

The SE Aircon CRM has been significantly refactored to provide a consistent, scalable, and maintainable codebase. This document outlines the unified system architecture and how all components work together.

## ✅ Completed Refactoring

### 1. Unified Form System
- **Central Configuration**: All forms use `/src/components/ui/form-config.tsx` for field definitions
- **Dynamic Forms**: `/src/components/ui/dynamic-form.tsx` renders forms based on configuration
- **Form Manager**: `/src/components/ui/unified-form-manager.tsx` handles CRUD operations
- **Standardized Components**: Consistent `FormInput`, `FormSelect`, `FormTextarea`, etc.

### 2. Consistent UI Components
- **Buttons**: All action buttons use `bg-gray-900 hover:bg-gray-800 text-white` (monochrome black)
- **Floating Action Buttons**: Standardized monochrome variant across all sections
- **Icons**: Consistent Lucide React icon library usage throughout
- **Status Badges**: Unified color coding and styling

### 3. Shared UI Library (`/src/components/ui/`)

#### Core Components
- `form-inputs.tsx` - Standardized form elements
- `form-modal.tsx` - Modal wrapper with consistent styling
- `dynamic-form.tsx` - Configuration-driven form renderer
- `table.tsx` - Standardized table components
- `section-header.tsx` - Consistent page headers with search/filter
- `modal.tsx` - Reusable modal components for view/edit
- `floating-action-button.tsx` - FAB component
- `button.tsx`, `input.tsx`, `select.tsx`, etc. - Base UI components

#### Module-Specific Components
- `module-form-modals.tsx` - Pre-styled modals for each module
- `unified-form-manager.tsx` - CRUD operations for all modules
- `form-config.tsx` - Field configurations for all forms

### 4. Design System
- **Central Configuration**: `/src/lib/design-system.ts`
- **Status Configurations**: Consistent status colors across all modules
- **Color Palette**: Standardized color system
- **Typography Scale**: Consistent text sizing and weights
- **Helper Functions**: Unified currency, date, and time formatting

### 5. Module Refactoring Status

#### ✅ Fully Unified
- **Leads**: Uses `useLeadFormManager` with dynamic forms
- **Employees**: Uses `useEmployeeFormManager` with unified UI
- **Projects**: Uses `useProjectFormManager` with consistent styling

#### ✅ Recently Updated
- **Site Visits**: Refactored to use `useSiteVisitFormManager`
- **Quotations**: Updated to use `useQuotationFormManager`

#### 🔄 In Progress
- **Invoices**: Has form manager, needs UI consistency update
- **Payments**: Has form manager, needs UI consistency update
- **Installations**: Has form manager, needs UI consistency update
- **AMC Contracts**: Has form manager, needs UI consistency update

## Current File Structure

```
src/
├── components/
│   ├── ui/                           # Shared UI components
│   │   ├── form-inputs.tsx          # Standardized form elements
│   │   ├── form-modal.tsx           # Modal wrapper
│   │   ├── dynamic-form.tsx         # Configuration-driven forms
│   │   ├── unified-form-manager.tsx # CRUD operations
│   │   ├── form-config.tsx          # Field configurations
│   │   ├── table.tsx                # Standardized tables
│   │   ├── section-header.tsx       # Page headers
│   │   ├── modal.tsx                # Reusable modals
│   │   ├── floating-action-button.tsx
│   │   ├── module-form-modals.tsx   # Module-specific modals
│   │   └── ...                      # Other base UI components
│   │
│   ├── admin/                       # Feature-specific components
│   │   ├── leads/
│   │   │   └── UnifiedLeadsList.tsx # ✅ Uses unified system
│   │   ├── employees/
│   │   │   ├── UnifiedEmployeeList.tsx # ✅ Uses unified system
│   │   │   └── CreateEmployeeFormDialog.tsx # 🔄 Legacy, to be removed
│   │   ├── projects/
│   │   │   └── UnifiedProjectsList.tsx # ✅ Uses unified system
│   │   ├── site-visits/
│   │   │   └── SiteVisitsList.tsx   # ✅ Recently updated
│   │   ├── quotations/
│   │   │   └── QuotationsList.tsx   # ✅ Recently updated
│   │   └── ...                      # Other modules
│   │
│   └── ContactForm.tsx              # Public contact form
│
├── lib/
│   ├── design-system.ts             # ✅ Central design configuration
│   ├── enhanced-types.ts            # Type definitions
│   └── ...                          # Other utilities
│
└── app/                             # Next.js app router pages
    └── admin/                       # Admin dashboard pages
```

## How to Use the Unified System

### 1. Creating a New Form

```tsx
// Use the form manager hook
const {
  openCreateModal,
  FormModal: CreateModal
} = useModuleFormManager(dependencies, onSuccess)

// Render the modal
<CreateModal />

// Trigger the modal
<Button onClick={openCreateModal}>Create New</Button>
```

### 2. Using Standardized Components

```tsx
import { Table, SectionHeader, SearchFilterBar } from '@/components/ui'
import { getStatusConfig, formatCurrency } from '@/lib/design-system'

// Page header with consistent styling
<SectionHeader
  title="Module Name"
  description="Manage your items"
  primaryAction={{
    label: "Create Item",
    onClick: openCreateModal
  }}
/>

// Search and filters
<SearchFilterBar
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  filters={[...]}
/>

// Data table
<Table
  columns={columns}
  data={filteredData}
  onRowClick={handleRowClick}
/>
```

### 3. Status Badges

```tsx
import { getStatusConfig } from '@/lib/design-system'

const statusConfig = getStatusConfig('leads', lead.status)
<Badge className={statusConfig.color}>
  {statusConfig.label}
</Badge>
```

## Benefits Achieved

### 1. Consistency
- All forms follow the same pattern and styling
- Consistent button colors and interactions
- Unified status color coding across modules
- Standardized table layouts and modal designs

### 2. Maintainability
- Central configuration for all forms
- Shared components reduce code duplication
- Changes in one place reflect across all modules
- Clear separation of concerns

### 3. Scalability
- Easy to add new modules using existing patterns
- Form fields can be added/modified through configuration
- Reusable components speed up development
- Consistent patterns make onboarding easier

### 4. Developer Experience
- Clear documentation and examples
- TypeScript support for better development
- Standardized imports and usage patterns
- Easy to customize while maintaining consistency

## Next Steps

### Immediate Priorities
1. **Complete Remaining Modules**: Update Invoices, Payments, Installations, AMC to use unified UI components
2. **Remove Legacy Components**: Delete old form dialogs that have been replaced
3. **Add Table Components**: Replace remaining custom tables with standardized Table component
4. **Update Documentation**: Add usage examples for all new components

### Future Enhancements
1. **Performance Optimization**: Lazy loading of form configurations
2. **Advanced Filtering**: Enhanced search and filter capabilities
3. **Export Functionality**: Standardized export across all modules
4. **Responsive Design**: Ensure mobile-first design across all components
5. **Accessibility**: Add ARIA labels and keyboard navigation

## Migration Guide

For developers working on this codebase:

1. **Use Unified Forms**: Always use the form managers instead of creating custom forms
2. **Follow Design System**: Use colors and configurations from `/src/lib/design-system.ts`
3. **Import from UI Library**: Use components from `/src/components/ui/` when available
4. **Consistent Patterns**: Follow the patterns established in the unified modules
5. **Update Legacy Code**: Gradually refactor old components to use the new system

This unified system ensures that the SE Aircon CRM remains consistent, maintainable, and easy to extend as business requirements evolve.
