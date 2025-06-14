'use client'

import React from 'react'
import { Plus } from 'lucide-react'

interface FloatingActionButtonProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
  gradientFrom?: string
  gradientTo?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'gradient' | 'monochrome'
  className?: string
}

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6'
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16'
}

const iconSizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7'
}

export function FloatingActionButton({
  onClick,
  icon,
  label = 'Add New',
  gradientFrom = 'from-blue-500',
  gradientTo = 'to-cyan-500',
  position = 'bottom-right',
  size = 'md',
  variant = 'gradient',
  className = ''
}: FloatingActionButtonProps) {
  const baseClasses = `
    flex items-center justify-center 
    ${sizeClasses[size]} 
    text-white rounded-full shadow-lg hover:shadow-xl 
    transform hover:scale-105 active:scale-95
    transition-all duration-200 
    focus:outline-none focus:ring-4
    group
  `
  
  const variantClasses = variant === 'monochrome' 
    ? 'bg-gray-900 hover:bg-gray-800 focus:ring-gray-300/50'
    : `bg-gradient-to-r ${gradientFrom} ${gradientTo} focus:ring-blue-300/50`

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses}`}
        title={label}
        aria-label={label}
      >
        {icon ? (
          <div className={iconSizeClasses[size]}>
            {icon}
          </div>
        ) : (
          <Plus className={iconSizeClasses[size]} />
        )}
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          {label}
        </span>
      </button>
    </div>
  )
}

// Predefined FABs for different modules
export function LeadsFAB({ onClick, className, variant = 'monochrome' }: { onClick: () => void; className?: string; variant?: 'gradient' | 'monochrome' }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Add New Lead"
      variant={variant}
      gradientFrom="from-cyan-500"
      gradientTo="to-blue-500"
      className={className}
    />
  )
}

export function ProjectsFAB({ onClick, className, variant = 'gradient' }: { onClick: () => void; className?: string; variant?: 'gradient' | 'monochrome' }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Create Project"
      variant={variant}
      gradientFrom="from-green-500"
      gradientTo="to-teal-500"
      className={className}
    />
  )
}

export function QuotationsFAB({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Create Quotation"
      gradientFrom="from-purple-500"
      gradientTo="to-indigo-500"
      className={className}
    />
  )
}

export function InvoicesFAB({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Create Invoice"
      gradientFrom="from-blue-500"
      gradientTo="to-cyan-500"
      className={className}
    />
  )
}

export function PaymentsFAB({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Record Payment"
      gradientFrom="from-green-500"
      gradientTo="to-emerald-500"
      className={className}
    />
  )
}

export function EmployeesFAB({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Add Employee"
      gradientFrom="from-indigo-500"
      gradientTo="to-purple-500"
      className={className}
    />
  )
}

export function SiteVisitsFAB({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Schedule Visit"
      gradientFrom="from-orange-500"
      gradientTo="to-red-500"
      className={className}
    />
  )
}

export function InstallationsFAB({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Add Installation"
      gradientFrom="from-emerald-500"
      gradientTo="to-green-500"
      className={className}
    />
  )
}

export function AMCFAB({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Create AMC"
      gradientFrom="from-amber-500"
      gradientTo="to-orange-500"
      className={className}
    />
  )
}

export default FloatingActionButton
