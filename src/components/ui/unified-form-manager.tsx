'use client'

import React from 'react'
import { 
  getLeadFormConfig,
  getEmployeeFormConfig,
  getProjectFormConfig,
  getSiteVisitFormConfig,
  getInstallationFormConfig,
  getAMCFormConfig,
  getInvoiceFormConfig,
  getPaymentFormConfig,
  getQuotationFormConfig,
  FormConfig
} from './form-config'
import { DynamicForm, useFormModal } from './dynamic-form'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"

// Type definitions for each module
export type ModuleType = 'leads' | 'employees' | 'projects' | 'sitevisits' | 'installations' | 'amc' | 'invoices' | 'payments' | 'quotations'

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

interface FormManagerProps {
  module: ModuleType
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: any
  mode?: 'create' | 'edit'
  // Dynamic props for each module
  customers?: any[]
  employees?: any[]
  projects?: any[]
  leads?: any[]
  invoices?: any[]
  consultationRequests?: any[]
}

interface UnifiedFormManagerProps {
  modules: ModuleType[]
  children: (managers: Record<ModuleType, FormManager>) => React.ReactNode
  // Common data for all modules
  customers?: any[]
  employees?: any[]
  projects?: any[]
  leads?: any[]
  invoices?: any[]
  consultationRequests?: any[]
}

class FormManager {
  private config: FormConfig
  private supabase: any
  private module: ModuleType
  private commonData: any

  constructor(module: ModuleType, commonData: any = {}) {
    this.module = module
    this.commonData = commonData
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    this.config = this.getConfigForModule(module)
  }

  private getConfigForModule(module: ModuleType): FormConfig {
    const { customers = [], employees = [], projects = [], leads = [], invoices = [], consultationRequests = [] } = this.commonData

    switch (module) {
      case 'leads':
        return getLeadFormConfig()
      case 'employees':
        return getEmployeeFormConfig()
      case 'projects':
        return getProjectFormConfig(customers, employees)
      case 'sitevisits':
        return getSiteVisitFormConfig(leads, employees)
      case 'installations':
        return getInstallationFormConfig(projects, employees)
      case 'amc':
        return getAMCFormConfig(customers, employees)
      case 'invoices':
        return getInvoiceFormConfig(projects, customers)
      case 'payments':
        return getPaymentFormConfig(invoices)
      case 'quotations':
        return getQuotationFormConfig(customers, projects, consultationRequests)
      default:
        throw new Error(`Unknown module: ${module}`)
    }
  }

  private getTableName(module: ModuleType): string {
    const tableMap = {
      leads: 'consultation_requests',  // Fixed: leads are stored in consultation_requests table
      employees: 'employees',
      projects: 'projects',
      sitevisits: 'site_visits',
      installations: 'installations',
      amc: 'amc_contracts',
      invoices: 'invoices',
      payments: 'payments',
      quotations: 'quotations'
    }
    return tableMap[module]
  }

  async create(formData: any): Promise<void> {
    const tableName = this.getTableName(this.module)
    
    // Handle quotations with special logic (customer creation, items, validation)
    if (this.module === 'quotations') {
      return this.createQuotation(formData)
    }

    // Handle invoices with special logic (project linking, items, validation)
    if (this.module === 'invoices') {
      return this.createInvoice(formData)
    }
    
    // Prepare data based on module
    const preparedData = this.prepareFormData(formData)
    
    const { error } = await this.supabase
      .from(tableName)
      .insert([preparedData])

    if (error) {
      console.error(`Error creating ${this.module}:`, error)
      console.error('Table name:', tableName)
      console.error('Prepared data:', preparedData)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw error
    }

    const successMessage = this.getSuccessMessage('create')
    notify.success(successMessage)
  }

  private async createQuotation(formData: any): Promise<void> {
    // Validate quotation-specific requirements
    if (!formData.items || !Array.isArray(formData.items) || formData.items.length === 0) {
      throw new Error('At least one item is required for quotations.')
    }

    let customer_id = formData.customer_id
    let project_id = formData.project_id

    // Create new customer if needed
    if (formData.customer_type === 'new' || (formData.customer_type === 'consultation' && !formData.customer_id)) {
      const newCustomerData = {
        name: formData.customer_name,
        email: formData.customer_email,
        phone: formData.customer_phone,
        address: formData.customer_address
      }

      const { data: newCustomerResult, error: customerError } = await this.supabase
        .from('customers')
        .insert([newCustomerData])
        .select()
        .single()

      if (customerError) {
        throw new Error(`Failed to create customer: ${customerError.message}`)
      }
      customer_id = newCustomerResult.id
    }

    // Ensure project is required
    if (!project_id) {
      throw new Error('Project is required for quotations. Every quotation must be linked to a project.')
    }

    // Prepare quotation data
    const { items, customer_type, customer_name, customer_email, customer_phone, customer_address, ...quotationData } = formData
    
    const preparedData = this.prepareFormData({
      ...quotationData,
      customer_id,
      project_id,
      consultation_request_id: formData.customer_type === 'consultation' ? formData.consultation_request_id : null
    })

    // Create quotation first
    const { data: quotation, error: quotationError } = await this.supabase
      .from('quotations')
      .insert([preparedData])
      .select()
      .single()

    if (quotationError) {
      console.error('Error creating quotation:', quotationError)
      throw new Error(`Failed to create quotation: ${quotationError.message}`)
    }

    // Create quotation items
    if (items && items.length > 0) {
      const quotationItems = items.map((item: any) => ({
        quotation_id: quotation.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.total
      }))

      const { error: itemsError } = await this.supabase
        .from('quotation_items')
        .insert(quotationItems)

      if (itemsError) {
        console.error('Error creating quotation items:', itemsError)
        throw new Error(`Failed to create quotation items: ${itemsError.message}`)
      }
    }

    const successMessage = this.getSuccessMessage('create')
    notify.success(successMessage)
  }

  // Comprehensive invoice creation method with validation, project linkage, and line items support
  private async createInvoice(formData: any): Promise<void> {
    // Validate invoice using the validation method
    const validation = this.validateInvoice(formData)
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join('\n')
      throw new Error(`Validation failed:\n${errorMessages}`)
    }

    // Ensure project and customer are required
    if (!formData.project_id) {
      throw new Error('Project is required for invoices. Every invoice must be linked to a project.')
    }

    if (!formData.customer_id) {
      throw new Error('Customer is required for invoices.')
    }

    // Prepare invoice data
    const { items, ...invoiceData } = formData
    
    const preparedData = this.prepareFormData({
      ...invoiceData,
      // Set default payment terms if not provided
      payment_terms: formData.payment_terms || 'Net 30 days',
      // Auto-generate invoice number if not provided
      invoice_number: formData.invoice_number || `INV-${Date.now()}`,
      // Set default due date if not provided (30 days from invoice date)
      due_date: formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })

    // Create invoice first
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .insert([preparedData])
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      throw new Error(`Failed to create invoice: ${invoiceError.message}`)
    }

    // Create invoice items
    if (items && items.length > 0) {
      const invoiceItems = items.map((item: any) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.total
      }))

      const { error: itemsError } = await this.supabase
        .from('invoice_items')
        .insert(invoiceItems)

      if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
        throw new Error(`Failed to create invoice items: ${itemsError.message}`)
      }
    }

    const successMessage = this.getSuccessMessage('create')
    notify.success(successMessage)
  }

  // Enhanced validation for invoices (similar to quotations)
  validateInvoice(formData: any): ValidationResult {
    const errors: any = {}

    // Business rule: Invoice must be linked to a project
    if (!formData.project_id) {
      errors.project_id = 'Project linkage is required for all invoices'
    }

    // Business rule: Customer information is required
    if (!formData.customer_id) {
      errors.customer_id = 'Customer selection is required'
    }

    // Invoice type is required
    if (!formData.invoice_type) {
      errors.invoice_type = 'Invoice type must be specified'
    }

    // Business rule: At least one line item must be present
    if (!formData.items || !Array.isArray(formData.items) || formData.items.length === 0) {
      errors.items = 'At least one invoice item is required'
    } else {
      // Validate each line item
      const hasValidItems = formData.items.some((item: any) => 
        item.description?.trim() && 
        item.quantity > 0 && 
        item.unit_price > 0
      )
      
      if (!hasValidItems) {
        errors.items = 'At least one item must have valid description, quantity, and unit price'
      }
    }

    // Validate required financial fields
    if (!formData.total_amount || formData.total_amount <= 0) {
      errors.total_amount = 'Total amount must be greater than zero'
    }

    // Payment terms validation
    if (!formData.payment_terms) {
      errors.payment_terms = 'Payment terms are required'
    }

    // Due date validation
    if (!formData.due_date) {
      errors.due_date = 'Due date is required'
    } else {
      const dueDate = new Date(formData.due_date)
      const invoiceDate = new Date(formData.invoice_date || new Date())
      if (dueDate < invoiceDate) {
        errors.due_date = 'Due date cannot be before invoice date'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  private getSuccessMessage(action: 'create' | 'update' | 'delete'): string {
    const moduleLabels = {
      leads: 'Lead',
      employees: 'Employee', 
      projects: 'Project',
      sitevisits: 'Site Visit',
      installations: 'Installation',
      amc: 'AMC Contract',
      invoices: 'Invoice',
      payments: 'Payment',
      quotations: 'Quotation'
    }

    const actionLabels = {
      create: 'Created',
      update: 'Updated', 
      delete: 'Deleted'
    }

    const moduleLabel = moduleLabels[this.module] || this.module
    const actionLabel = actionLabels[action] || action
    
    return `${moduleLabel} ${actionLabel} Successfully`
  }

  async update(id: string, formData: any): Promise<void> {
    const tableName = this.getTableName(this.module)
    
    // Prepare data based on module
    const preparedData = this.prepareFormData(formData)
    
    const { error } = await this.supabase
      .from(tableName)
      .update(preparedData)
      .eq('id', id)

    if (error) {
      console.error(`Error updating ${this.module}:`, error)
      throw error
    }

    const successMessage = this.getSuccessMessage('update')
    notify.success(successMessage)
  }

  async delete(id: string): Promise<void> {
    const tableName = this.getTableName(this.module)
    
    const { error } = await this.supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting ${this.module}:`, error)
      throw error
    }

    const successMessage = this.getSuccessMessage('delete')
    notify.success(successMessage)
  }

  private prepareFormData(formData: any): any {
    // Module-specific data preparation
    switch (this.module) {
      case 'leads':
        return {
          ...formData,
          status: formData.status || 'new'
        }
      case 'employees':
        return {
          ...formData,
          hire_date: formData.hire_date || new Date().toISOString().split('T')[0],
          status: formData.status || 'active'
        }
      case 'projects':
        return {
          ...formData,
          project_number: formData.project_number || `PRJ-${Date.now()}`,
          status: formData.status || 'planning'
        }
      case 'quotations':
        // Generate quotation number if not provided
        const quotationNumber = formData.quote_number || `QUO-${Date.now()}`
        
        return {
          ...formData,
          quote_number: quotationNumber,
          status: formData.status || 'draft',
          issue_date: formData.issue_date || new Date().toISOString().split('T')[0],
          tax_rate: formData.tax_rate || 18.00,
          discount_percentage: formData.discount_percentage || 0,
          discount_amount: formData.discount_amount || 0,
          // Set default terms if not provided
          terms_and_conditions: formData.terms_and_conditions || `1. All prices are in Indian Rupees (INR)
2. Installation will be completed within 7-10 working days from confirmation
3. 1 year comprehensive warranty on all equipment
4. Payment terms: 50% advance, 50% on completion
5. GST will be added as applicable
6. This quotation is valid for 30 days from the date of issue`,
          // Ensure required fields
          customer_id: formData.customer_id,
          project_id: formData.project_id
        }
      case 'invoices':
        return {
          ...formData,
          invoice_number: formData.invoice_number || `INV-${Date.now()}`,
          status: formData.status || 'draft'
        }
      case 'payments':
        return {
          ...formData,
          payment_date: formData.payment_date || new Date().toISOString().split('T')[0],
          status: formData.status || 'completed'
        }
      case 'sitevisits':
        return {
          ...formData,
          status: formData.status || 'scheduled'
        }
      case 'installations':
        return {
          ...formData,
          status: formData.status || 'scheduled'
        }
      case 'amc':
        return {
          ...formData,
          contract_number: formData.contract_number || `AMC-${Date.now()}`,
          status: formData.status || 'active'
        }
      default:
        return formData
    }
  }

  getConfig(): FormConfig {
    return this.config
  }

  useForm(onSuccess?: () => void) {
    return useFormModal(
      this.config,
      async (formData: any) => {
        await this.create(formData)
        onSuccess?.()
      }
    )
  }

  useEditForm(initialData: any, onSuccess?: () => void) {
    return useFormModal(
      this.config,
      async (formData: any) => {
        await this.update(initialData.id, formData)
        onSuccess?.()
      },
      initialData
    )
  }
}

// Unified Form Manager Hook
export function useUnifiedFormManager(commonData: any = {}) {
  const managers = React.useMemo(() => {
    const moduleTypes: ModuleType[] = [
      'leads', 
      'employees', 
      'projects', 
      'sitevisits', 
      'installations', 
      'amc', 
      'invoices', 
      'payments', 
      'quotations'
    ]

    return moduleTypes.reduce((acc, module) => {
      acc[module] = new FormManager(module, commonData)
      return acc
    }, {} as Record<ModuleType, FormManager>)
  }, [commonData])

  return managers
}

// Individual Module Hooks
export function useLeadFormManager(onSuccess?: () => void) {
  const manager = new FormManager('leads')
  return manager.useForm(onSuccess)
}

export function useEmployeeFormManager(onSuccess?: () => void) {
  const manager = new FormManager('employees')
  return manager.useForm(onSuccess)
}

export function useProjectFormManager(customers: any[] = [], employees: any[] = [], onSuccess?: () => void) {
  const manager = new FormManager('projects', { customers, employees })
  return manager.useForm(onSuccess)
}

export function useQuotationFormManager(
  customers: any[] = [], 
  projects: any[] = [], 
  consultationRequests: any[] = [], 
  onSuccess?: () => void
) {
  const manager = new FormManager('quotations', { customers, projects, consultationRequests })
  return manager.useForm(onSuccess)
}

export function useInvoiceFormManager(projects: any[] = [], customers: any[] = [], onSuccess?: () => void) {
  const manager = new FormManager('invoices', { projects, customers })
  return manager.useForm(onSuccess)
}

export function usePaymentFormManager(invoices: any[] = [], onSuccess?: () => void) {
  const manager = new FormManager('payments', { invoices })
  return manager.useForm(onSuccess)
}

export function useSiteVisitFormManager(leads: any[] = [], employees: any[] = [], onSuccess?: () => void) {
  const manager = new FormManager('sitevisits', { leads, employees })
  return manager.useForm(onSuccess)
}

export function useInstallationFormManager(projects: any[] = [], employees: any[] = [], onSuccess?: () => void) {
  const manager = new FormManager('installations', { projects, employees })
  return manager.useForm(onSuccess)
}

export function useAMCFormManager(customers: any[] = [], employees: any[] = [], onSuccess?: () => void) {
  const manager = new FormManager('amc', { customers, employees })
  return manager.useForm(onSuccess)
}

// Export the FormManager class for direct usage
export { FormManager }

// Re-export everything from dynamic-form for convenience
export { DynamicForm, useFormModal } from './dynamic-form'
export * from './form-config'
