'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FormField } from './form-modal'

// Standardized form input component
interface FormInputProps {
  label: string
  name: string
  value: string | number
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'date' | 'datetime-local' | 'time'
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
  icon?: React.ReactNode
  className?: string
}

export function FormInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  error,
  hint,
  disabled,
  min,
  max,
  step,
  icon,
  className = ''
}: FormInputProps) {
  return (
    <FormField label={label} required={required} error={error} hint={hint} className={className}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}
        />
      </div>
    </FormField>
  )
}

// Standardized textarea component
interface FormTextareaProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
  rows?: number
  className?: string
}

export function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
  hint,
  disabled,
  rows = 3,
  className = ''
}: FormTextareaProps) {
  return (
    <FormField label={label} required={required} error={error} hint={hint} className={className}>
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 resize-none ${
          error ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
        }`}
      />
    </FormField>
  )
}

// Standardized select component
interface FormSelectOption {
  value: string
  label: string
  description?: string
  color?: string
  disabled?: boolean
}

interface FormSelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: FormSelectOption[]
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
  showBadges?: boolean
  className?: string
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required,
  error,
  hint,
  disabled,
  showBadges = false,
  className = ''
}: FormSelectProps) {
  const selectedOption = options.find(opt => opt.value === value)

  return (
    <FormField label={label} required={required} error={error} hint={hint} className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          disabled={disabled}
          className={`bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 ${
            error ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              displayText={option.label} // Provide clean text for SelectValue
              className={option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {showBadges && option.color ? (
                    <Badge className={`${option.color} text-xs`}>
                      {option.label}
                    </Badge>
                  ) : (
                    <span className="font-medium">{option.label}</span>
                  )}
                </div>
                {option.description && (
                  <span className="text-sm text-gray-500">{option.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}

// Read-only display field
interface FormDisplayProps {
  label: string
  value: string | number
  hint?: string
  className?: string
}

export function FormDisplay({ label, value, hint, className = '' }: FormDisplayProps) {
  return (
    <FormField label={label} hint={hint} className={className}>
      <Input
        value={value}
        readOnly
        className="bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed"
      />
    </FormField>
  )
}

// Currency input component
interface FormCurrencyInputProps {
  label: string
  name: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
  currency?: string
  min?: number
  max?: number
  className?: string
}

export function FormCurrencyInput({
  label,
  name,
  value,
  onChange,
  placeholder = '0.00',
  required,
  error,
  hint,
  disabled,
  currency = '₹',
  min = 0,
  max,
  className = ''
}: FormCurrencyInputProps) {
  return (
    <FormField label={label} required={required} error={error} hint={hint} className={className}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
          {currency}
        </div>
        <Input
          id={name}
          name={name}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step="0.01"
          className={`bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 pl-8 ${
            error ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
          }`}
        />
      </div>
    </FormField>
  )
}

export default {
  FormInput,
  FormTextarea,
  FormSelect,
  FormDisplay,
  FormCurrencyInput
}
