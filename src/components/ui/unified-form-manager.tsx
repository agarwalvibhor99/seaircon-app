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

    notify.success(`${this.module} created successfully`)
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

    notify.success(`${this.module} updated successfully`)
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

    notify.success(`${this.module} deleted successfully`)
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
        return {
          ...formData,
          quotation_number: formData.quotation_number || `QT-${Date.now()}`,
          status: formData.status || 'draft'
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
