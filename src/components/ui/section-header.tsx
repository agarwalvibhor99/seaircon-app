'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  description?: string
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryActions?: Array<{
    label: string
    onClick: () => void
    icon?: React.ReactNode
    variant?: 'default' | 'outline' | 'ghost'
  }>
  className?: string
}

interface SearchFilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: Array<{
    label: string
    value: string
    options: Array<{ value: string; label: string; count?: number }>
    onChange: (value: string) => void
  }>
  className?: string
}

export function SectionHeader({
  title,
  description,
  primaryAction,
  secondaryActions = [],
  className = ''
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>
      
      {(primaryAction || secondaryActions.length > 0) && (
        <div className="flex items-center gap-3">
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2"
            >
              {primaryAction.icon || <Plus className="h-4 w-4" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  filters = [],
  className = ''
}: SearchFilterBarProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-4', className)}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-200"
          />
        </div>

        {/* Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="h-4 w-4 text-gray-400" />
            {filters.map((filter, index) => (
              <Select
                key={index}
                value={filter.value}
                onValueChange={filter.onChange}
              >
                <SelectTrigger className="w-auto min-w-[120px] bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-200">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                      {option.count !== undefined && (
                        <span className="ml-2 text-xs text-gray-500">({option.count})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Standalone filter component for more complex scenarios
interface FilterDropdownProps {
  label: string
  value: string
  options: Array<{ value: string; label: string; count?: number }>
  onChange: (value: string) => void
  className?: string
}

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
  className = ''
}: FilterDropdownProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn('w-auto min-w-[120px] bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-200', className)}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="bg-white border-gray-200">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
            {option.count !== undefined && (
              <span className="ml-2 text-xs text-gray-500">({option.count})</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SectionHeader
