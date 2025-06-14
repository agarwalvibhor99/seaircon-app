'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  gradientFrom?: string
  gradientTo?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  className?: string
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl'
}

export function FormModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  icon, 
  children, 
  gradientFrom = 'from-blue-500',
  gradientTo = 'to-cyan-500',
  maxWidth = '4xl',
  className = ''
}: FormModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className={`w-full ${maxWidthClasses[maxWidth]} max-h-[95vh] overflow-hidden bg-white/95 backdrop-blur-md shadow-2xl border-0 ${className} flex flex-col`}>
        <CardHeader className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white relative overflow-hidden shrink-0`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  {icon}
                </div>
              )}
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold">{title}</CardTitle>
                {subtitle && (
                  <p className="text-white/90 mt-1 text-sm sm:text-base">{subtitle}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 min-h-0">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

// Form Actions Component - Standardized button layout
interface FormActionsProps {
  onCancel: () => void
  onSubmit?: () => void
  isSubmitting?: boolean
  submitLabel?: string
  cancelLabel?: string
  submitIcon?: React.ReactNode
  disabled?: boolean
  className?: string
}

export function FormActions({
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitIcon,
  disabled = false,
  className = ''
}: FormActionsProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
        disabled={isSubmitting}
      >
        {cancelLabel}
      </Button>
      <Button
        type={onSubmit ? 'button' : 'submit'}
        onClick={onSubmit}
        disabled={isSubmitting || disabled}
        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg order-1 sm:order-2"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="hidden sm:inline">Processing...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {submitIcon}
            <span>{submitLabel}</span>
          </div>
        )}
      </Button>
    </div>
  )
}

// Form Section Component - Standardized section layout
interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

// Form Grid Component - Responsive grid layout
interface FormGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function FormGrid({ children, columns = 2, className = '' }: FormGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 lg:gap-6 ${className}`}>
      {children}
    </div>
  )
}

// Form Field Component - Standardized field layout
interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, required, error, hint, children, className = '' }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  )
}

export default FormModal
