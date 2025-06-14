# Unified Form System Documentation

## Overview

The unified form system provides a consistent, reusable, and extensible way to handle all form interactions across the SE Aircon CRM system. All forms now follow the same modal-based pattern with consistent UI/UX, validation, and extensibility.

## Key Components

### 1. Core Components

- **`FormConfig`** - Configuration object that defines form structure, fields, sections, and validation
- **`DynamicForm`** - Main form renderer that creates forms based on configuration
- **`FormModal`** - Base modal wrapper with standardized layout and styling
- **`FormManager`** - Class that handles CRUD operations for each module
- **`UnifiedFormManager`** - Hook that provides form managers for all modules

### 2. Form Input Components

- **`FormInput`** - Standardized text, email, number, date inputs
- **`FormTextarea`** - Multi-line text input
- **`FormSelect`** - Dropdown with badge support
- **`FormCurrencyInput`** - Currency input with formatting
- **`FormDisplay`** - Read-only display field

### 3. Layout Components

- **`FormSection`** - Groups related fields with optional title/description
- **`FormGrid`** - Responsive grid layout for form fields
- **`FormActions`** - Standardized submit/cancel button layout
- **`FloatingActionButton`** - Consistent FAB for create actions

## Usage Examples

### Basic Form Setup

```tsx
import { useLeadFormManager } from '@/components/ui/unified-form-manager'

function LeadsPage() {
  const {
    openCreateModal,
    FormModal: CreateFormModal
  } = useLeadFormManager(() => {
    // Refresh data after successful creation
    window.location.reload()
  })

  return (
    <div>
      <Button onClick={openCreateModal}>Add New Lead</Button>
      <CreateFormModal />
    </div>
  )
}
```

### Advanced Form with Dependencies

```tsx
import { useProjectFormManager } from '@/components/ui/unified-form-manager'

function ProjectsPage({ customers, employees }) {
  const {
    openCreateModal,
    FormModal: CreateFormModal
  } = useProjectFormManager(customers, employees, () => {
    window.location.reload()
  })

  return (
    <div>
      <Button onClick={openCreateModal}>Create Project</Button>
      <CreateFormModal />
    </div>
  )
}
```

### Multiple Forms in One Component

```tsx
import { useUnifiedFormManager } from '@/components/ui/unified-form-manager'

function DashboardPage({ commonData }) {
  const managers = useUnifiedFormManager(commonData)

  const leadForm = managers.leads.useForm(() => refreshData())
  const projectForm = managers.projects.useForm(() => refreshData())
  
  return (
    <div>
      <Button onClick={leadForm.openCreateModal}>Add Lead</Button>
      <Button onClick={projectForm.openCreateModal}>Add Project</Button>
      
      <leadForm.FormModal />
      <projectForm.FormModal />
    </div>
  )
}
```

## Form Configuration

### Creating a New Form Config

```tsx
import { FormConfig, FormFieldConfig } from '@/components/ui/form-config'

export const getCustomFormConfig = (): FormConfig => ({
  title: 'Create Custom Item',
  subtitle: 'Add a new custom item to the system',
  module: 'custom',
  maxWidth: '4xl',
  submitLabel: 'Create Item',
  sections: [
    {
      title: 'Basic Information',
      fields: [
        {
          name: 'name',
          label: 'Item Name',
          type: 'text',
          required: true,
          placeholder: 'Enter item name',
          icon: <User className="h-4 w-4" />
        },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          required: true,
          options: [
            { value: 'type1', label: 'Type 1', color: 'bg-blue-100 text-blue-800' },
            { value: 'type2', label: 'Type 2', color: 'bg-green-100 text-green-800' }
          ],
          showBadges: true
        }
      ],
      columns: 2
    }
  ]
})
```

### Field Types

| Type | Description | Props |
|------|-------------|--------|
| `text` | Single-line text input | `placeholder`, `icon` |
| `email` | Email input with validation | `placeholder`, `icon` |
| `tel` | Phone number input | `placeholder`, `icon` |
| `number` | Numeric input | `min`, `max`, `step` |
| `currency` | Currency input with formatting | `currency`, `min`, `max` |
| `date` | Date picker | `min`, `max` |
| `time` | Time picker | - |
| `textarea` | Multi-line text input | `rows`, `placeholder` |
| `select` | Dropdown selection | `options`, `showBadges` |
| `display` | Read-only display field | - |

### Field Properties

```tsx
interface FormFieldConfig {
  name: string              // Field identifier
  label: string            // Display label
  type: FieldType          // Input type
  required?: boolean       // Validation requirement
  placeholder?: string     // Input placeholder
  hint?: string           // Help text
  options?: Option[]      // For select fields
  showBadges?: boolean    // Show colored badges in select
  min?: number | string   // Minimum value/length
  max?: number | string   // Maximum value/length
  step?: number | string  // Step for number inputs
  rows?: number          // Rows for textarea
  icon?: React.ReactNode // Leading icon
  disabled?: boolean     // Disable input
  currency?: string      // Currency symbol
  validation?: Function  // Custom validation
  showWhen?: Function    // Conditional display
}
```

## Styling and Theming

### Glassmorphism Design

All forms use a consistent glassmorphism design with:
- Semi-transparent backgrounds (`bg-white/95 backdrop-blur-sm`)
- Gradient headers with module-specific colors
- Soft shadows and rounded corners
- Smooth transitions and hover effects

### Module Color Schemes

- **Leads**: `from-cyan-500 to-blue-500`
- **Projects**: `from-blue-500 to-indigo-500`
- **Employees**: `from-blue-500 to-indigo-500`
- **Quotations**: `from-purple-500 to-pink-500`
- **Invoices**: `from-green-500 to-emerald-500`
- **Payments**: `from-yellow-500 to-orange-500`

### Responsive Design

Forms automatically adapt to different screen sizes:
- Mobile: Single column layout
- Tablet: 2-column layout for most sections
- Desktop: 2-4 column layout based on section configuration

## Validation

### Built-in Validation

- **Required fields** - Automatic validation for required fields
- **Email format** - Pattern validation for email fields
- **Phone format** - Pattern validation for phone fields
- **Number ranges** - Min/max validation for numeric fields

### Custom Validation

```tsx
{
  name: 'password',
  label: 'Password',
  type: 'password',
  required: true,
  validation: (value) => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain uppercase, lowercase, and number'
    }
  }
}
```

### Conditional Fields

```tsx
{
  name: 'other_details',
  label: 'Other Details',
  type: 'textarea',
  showWhen: (formData) => formData.category === 'other'
}
```

## Error Handling

### Automatic Error Display

- Field-level error messages appear below inputs
- Form-level validation prevents submission
- Toast notifications for success/error states
- Loading states during form submission

### Error Recovery

- Errors clear when user starts typing
- Form retains data on submission failure
- Retry mechanisms for network failures

## Accessibility

### Keyboard Navigation

- Tab order follows logical field sequence
- Enter key submits forms
- Escape key closes modals
- Arrow keys navigate select options

### Screen Reader Support

- Proper label associations
- ARIA attributes for complex controls
- Focus management in modals
- Status announcements for errors

### Visual Accessibility

- High contrast color schemes
- Focus indicators on all interactive elements
- Consistent visual hierarchy
- Readable font sizes and spacing

## Performance

### Optimization Features

- Lazy loading of form components
- Memoized form configurations
- Efficient re-rendering with React hooks
- Minimal bundle size with tree shaking

### Bundle Analysis

- Core form system: ~15KB gzipped
- Each module config: ~2-3KB
- Total overhead per page: ~20-25KB

## Extension Guide

### Adding a New Module

1. **Create Form Configuration**
```tsx
// src/components/ui/form-config.tsx
export const getNewModuleFormConfig = (): FormConfig => ({
  title: 'Create New Item',
  module: 'newmodule',
  sections: [/* ... */]
})
```

2. **Add to Unified Manager**
```tsx
// src/components/ui/unified-form-manager.tsx
case 'newmodule':
  return getNewModuleFormConfig()
```

3. **Create Hook**
```tsx
export function useNewModuleFormManager(onSuccess?: () => void) {
  const manager = new FormManager('newmodule')
  return manager.useForm(onSuccess)
}
```

### Custom Field Types

```tsx
// src/components/ui/form-inputs.tsx
export function FormCustomInput({ label, name, value, onChange, ...props }) {
  return (
    <FormField label={label} {...props}>
      <CustomComponent
        value={value}
        onChange={onChange}
        {...props}
      />
    </FormField>
  )
}
```

### Custom Validation Rules

```tsx
// src/lib/validation.ts
export const customValidators = {
  uniqueEmail: async (email) => {
    const exists = await checkEmailExists(email)
    return exists ? 'Email already exists' : undefined
  },
  
  validCurrency: (amount) => {
    return amount > 0 ? undefined : 'Amount must be positive'
  }
}
```

## Migration Guide

### Replacing Existing Forms

1. **Identify Current Form**
   - Locate existing form component
   - Note required props and data flow
   - Document current validation logic

2. **Create Configuration**
   - Use appropriate config generator
   - Map existing fields to new structure
   - Add any custom validation

3. **Replace Component**
   - Import unified form manager
   - Replace form JSX with modal usage
   - Update success/error handling

4. **Test and Refine**
   - Verify all fields work correctly
   - Test validation and error states
   - Ensure responsive behavior

### Example Migration

```tsx
// Before - Custom form component
function CreateLeadForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({})
  // ... lots of form handling code
}

// After - Unified form system
function LeadsPage() {
  const { openCreateModal, FormModal } = useLeadFormManager(() => {
    window.location.reload()
  })
  
  return (
    <div>
      <Button onClick={openCreateModal}>Add Lead</Button>
      <FormModal />
    </div>
  )
}
```

## Best Practices

### Form Design

1. **Keep forms focused** - Group related fields in logical sections
2. **Use appropriate field types** - Choose the right input for each data type
3. **Provide clear labels** - Use descriptive, action-oriented labels
4. **Add helpful hints** - Include guidance for complex fields
5. **Show progress** - Use loading states and progress indicators

### Performance

1. **Lazy load configs** - Only load form configs when needed
2. **Memoize callbacks** - Use useCallback for form handlers
3. **Batch state updates** - Group related state changes
4. **Optimize re-renders** - Use React.memo for expensive components

### User Experience

1. **Validate on blur** - Provide immediate feedback
2. **Save draft data** - Preserve form state on navigation
3. **Provide shortcuts** - Support keyboard navigation
4. **Show clear errors** - Use specific, actionable error messages
5. **Confirm destructive actions** - Ask before deleting or canceling

### Maintenance

1. **Document configurations** - Add comments to complex form configs
2. **Test edge cases** - Verify validation and error handling
3. **Monitor performance** - Track form completion rates
4. **Update regularly** - Keep dependencies and types current
5. **Follow conventions** - Use consistent naming and structure

## Troubleshooting

### Common Issues

**Form not submitting**
- Check required field validation
- Verify network connectivity
- Check browser console for errors

**Fields not appearing**
- Check conditional field logic
- Verify field configuration syntax
- Check for TypeScript errors

**Styling issues**
- Verify Tailwind classes are available
- Check for CSS conflicts
- Ensure proper responsive breakpoints

**Performance problems**
- Use React DevTools to identify re-renders
- Check for expensive computations in render
- Verify proper memoization usage

### Debug Mode

Enable debug mode to see detailed form information:

```tsx
// Add to form config for debugging
const config = {
  ...normalConfig,
  debug: process.env.NODE_ENV === 'development'
}
```

## Support

For additional help with the unified form system:

1. Check the inline TypeScript documentation
2. Review example implementations in the codebase
3. Test changes in development environment
4. Use React DevTools for debugging component state

The unified form system is designed to be intuitive and self-documenting. Most common use cases should work out of the box with minimal configuration.
