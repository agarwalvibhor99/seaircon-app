'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Save, X } from 'lucide-react'
import { FormConfig, FormFieldConfig, FormSectionConfig, validateFormData, getDefaultFormData } from './form-config'
import { FormModal, FormActions, FormSection, FormGrid } from './form-modal'
import { FormInput, FormTextarea, FormSelect, FormDisplay, FormCurrencyInput } from './form-inputs'
import { LineItemsField, QuotationItem } from './line-items-field'
import { 
  LeadsFormModal, 
  ProjectsFormModal, 
  QuotationsFormModal, 
  InvoicesFormModal, 
  PaymentsFormModal, 
  EmployeesFormModal, 
  SiteVisitsFormModal, 
  InstallationsFormModal, 
  AMCFormModal 
} from './module-form-modals'
import { notify } from "@/lib/toast"

interface DynamicFormProps {
  config: FormConfig
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: any) => Promise<void>
  initialData?: any
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

const MODULE_MODALS = {
  leads: LeadsFormModal,
  projects: ProjectsFormModal,
  quotations: QuotationsFormModal,
  invoices: InvoicesFormModal,
  payments: PaymentsFormModal,
  employees: EmployeesFormModal,
  sitevisits: SiteVisitsFormModal,
  installations: InstallationsFormModal,
  amc: AMCFormModal
}

export function DynamicForm({
  config,
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isSubmitting = false,
  mode = 'create'
}: DynamicFormProps) {
  const [formData, setFormData] = useState(() => ({
    ...getDefaultFormData(config),
    ...initialData
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev: any) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev, [fieldName]: value }
      
      // Special handling for quotation forms
      if (config.module === 'quotations') {
        // Auto-fill customer data when consultation request is selected
        if (fieldName === 'consultation_request_id' && value) {
          const consultationRequests = config.sections[0]?.fields.find(f => f.name === 'consultation_request_id')?.options || []
          const consultation = consultationRequests.find((cr: any) => cr.value === value)
          if (consultation) {
            // Parse consultation data from label if available
            const [name, serviceType] = consultation.label.split(' - ')
            newData.customer_name = name
            newData.quote_title = `${serviceType} Quotation for ${name}`
          }
        }
        
        // Clear customer fields when customer type changes
        if (fieldName === 'customer_type') {
          if (value === 'existing') {
            // Clear new customer fields
            newData.customer_name = ''
            newData.customer_email = ''
            newData.customer_phone = ''
            newData.customer_address = ''
            newData.consultation_request_id = ''
          } else if (value === 'new') {
            // Clear existing customer selection
            newData.customer_id = ''
            newData.consultation_request_id = ''
          } else if (value === 'consultation') {
            // Clear existing customer selection
            newData.customer_id = ''
          }
        }
      }
      
      return newData
    })
    
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  const handleTotalsChange = useCallback((totals: any) => {
    setFormData((prev: any) => ({
      ...prev,
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      discount_amount: totals.discountAmount,
      total_amount: totals.totalAmount
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validateFormData(formData, config)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Let the calling component handle validation error feedback
      return
    }

    try {
      await onSubmit(formData)
      // Let the calling component handle success toasts
      onClose()
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} ${config.module}:`, error)
      // Let the calling component handle error toasts too
    }
  }

  const renderField = (field: FormFieldConfig) => {
    const commonProps = {
      label: field.label,
      name: field.name,
      value: formData[field.name] || (field.type === 'currency' ? 0 : ''),
      onChange: (value: any) => handleFieldChange(field.name, value),
      placeholder: field.placeholder,
      disabled: field.disabled || isSubmitting,
      error: errors[field.name],
      hint: field.hint,
      required: field.required
    }

    switch (field.type) {
      case 'textarea':
        return (
          <FormTextarea
            {...commonProps}
            rows={field.rows}
          />
        )
      
      case 'select':
        return (
          <FormSelect
            {...commonProps}
            options={field.options || []}
            showBadges={field.showBadges}
          />
        )
      
      case 'currency':
        return (
          <FormCurrencyInput
            {...commonProps}
            value={formData[field.name] || 0}
            onChange={(value: number) => handleFieldChange(field.name, value)}
            currency={field.currency === 'INR' ? '₹' : field.currency}
          />
        )
      
      case 'display':
        return (
          <FormDisplay
            label={field.label}
            value={formData[field.name] || ''}
            hint={field.hint}
          />
        )
      
      case 'line-items':
        return (
          <LineItemsField
            {...commonProps}
            value={formData[field.name] || []}
            onChange={(items: QuotationItem[]) => handleFieldChange(field.name, items)}
            taxRate={formData.tax_rate || 18}
            discountPercentage={formData.discount_percentage || 0}
            onTotalsChange={handleTotalsChange}
          />
        )
      
      default:
        return (
          <FormInput
            {...commonProps}
            type={field.type as any}
            min={field.min}
            max={field.max}
            step={field.step}
            icon={field.icon}
          />
        )
    }
  }

  const shouldShowSection = (section: FormSectionConfig) => {
    return !section.showWhen || section.showWhen(formData)
  }

  const shouldShowField = (field: FormFieldConfig) => {
    return !field.showWhen || field.showWhen(formData)
  }

  const ModalComponent = MODULE_MODALS[config.module] || FormModal

  return (
    <ModalComponent
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? config.title.replace('Add', 'Edit').replace('Create', 'Edit') : config.title}
      subtitle={config.subtitle}
      maxWidth={config.maxWidth}
    >
      <div className="flex flex-col h-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-8 pr-2">
            {config.sections.map((section, sectionIndex) => {
              if (!shouldShowSection(section)) return null

              return (
                <FormSection
                  key={sectionIndex}
                  title={section.title}
                  description={section.description}
                >
                  <FormGrid columns={section.columns || 2}>
                    {section.fields.map((field, fieldIndex) => {
                      if (!shouldShowField(field)) return null

                      return (
                        <div key={fieldIndex} className="space-y-2">
                          {renderField(field)}
                        </div>
                      )
                    })}
                  </FormGrid>
                </FormSection>
              )
            })}
          </div>

          <div className="shrink-0 mt-6 bg-white sticky bottom-0">
            <FormActions 
              onCancel={onClose} 
              isSubmitting={isSubmitting}
              submitLabel={config.submitLabel || (mode === 'create' ? 'Create' : 'Update')}
              submitIcon={<Save className="h-4 w-4" />}
            />
          </div>
        </form>
      </div>
    </ModalComponent>
  )
}

// Convenience hook for form management
export function useFormModal<T = any>(
  config: FormConfig,
  onSubmit: (data: T) => Promise<void>,
  initialData?: Partial<T>
) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')

  const openCreateModal = () => {
    setMode('create')
    setIsOpen(true)
  }

  const openEditModal = (data: Partial<T>) => {
    setMode('edit')
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setIsSubmitting(false)
  }

  const handleSubmit = async (formData: T) => {
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const FormModal = () => (
    <DynamicForm
      config={config}
      isOpen={isOpen}
      onClose={closeModal}
      onSubmit={handleSubmit}
      initialData={initialData}
      isSubmitting={isSubmitting}
      mode={mode}
    />
  )

  return {
    isOpen,
    openCreateModal,
    openEditModal,
    closeModal,
    FormModal,
    isSubmitting
  }
}
