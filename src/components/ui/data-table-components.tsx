'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2, Download, Send, Play, Pause, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Status Badge Component
interface StatusBadgeProps {
  status: string
  statusConfig: Record<string, { color: string; label: string }>
  className?: string
}

export function StatusBadge({ status, statusConfig, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status }
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(config.color, className)}
    >
      {config.label}
    </Badge>
  )
}

// Action Buttons Component
interface ActionButtonsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDownload?: () => void
  onSend?: () => void
  onStart?: () => void
  onPause?: () => void
  onComplete?: () => void
  showView?: boolean
  showEdit?: boolean
  showDelete?: boolean
  showDownload?: boolean
  showSend?: boolean
  showStart?: boolean
  showPause?: boolean
  showComplete?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  onDownload,
  onSend,
  onStart,
  onPause,
  onComplete,
  showView = true,
  showEdit = true,
  showDelete = false,
  showDownload = false,
  showSend = false,
  showStart = false,
  showPause = false,
  showComplete = false,
  size = 'sm',
  className
}: ActionButtonsProps) {
  const buttonSize = size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-9 w-9' : 'h-10 w-10'
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'

  return (
    <div className={cn("flex gap-2", className)}>
      {showView && onView && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, "text-gray-600 hover:text-gray-900")}
          onClick={onView}
          title="View Details"
        >
          <Eye className={iconSize} />
        </Button>
      )}
      
      {showEdit && onEdit && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, "text-blue-600 hover:text-blue-900")}
          onClick={onEdit}
          title="Edit"
        >
          <Edit className={iconSize} />
        </Button>
      )}
      
      {showDownload && onDownload && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, "text-green-600 hover:text-green-900")}
          onClick={onDownload}
          title="Download"
        >
          <Download className={iconSize} />
        </Button>
      )}
      
      {showSend && onSend && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, "text-purple-600 hover:text-purple-900")}
          onClick={onSend}
          title="Send"
        >
          <Send className={iconSize} />
        </Button>
      )}
      
      {showStart && onStart && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, "text-green-600 hover:text-green-900")}
          onClick={onStart}
          title="Start"
        >
          <Play className={iconSize} />
        </Button>
      )}
      
      {showPause && onPause && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, "text-yellow-600 hover:text-yellow-900")}
          onClick={onPause}
          title="Pause"
        >
          <Pause className={iconSize} />
        </Button>
      )}
      
      {showComplete && onComplete && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, "text-green-600 hover:text-green-900")}
          onClick={onComplete}
          title="Mark Complete"
        >
          <CheckCircle className={iconSize} />
        </Button>
      )}
      
      {showDelete && onDelete && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, "text-red-600 hover:text-red-900")}
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className={iconSize} />
        </Button>
      )}
    </div>
  )
}

// Data Cell Component for consistent table cell formatting
interface DataCellProps {
  children: React.ReactNode
  className?: string
  truncate?: boolean
}

export function DataCell({ children, className, truncate = false }: DataCellProps) {
  return (
    <td className={cn(
      "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
      truncate && "max-w-0 truncate",
      className
    )}>
      {children}
    </td>
  )
}

// Currency formatting helper
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Date formatting helper
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  })
}

// Contact info component
interface ContactInfoProps {
  name: string
  phone?: string
  email?: string
  className?: string
  showPhone?: boolean
  showEmail?: boolean
}

export function ContactInfo({ 
  name, 
  phone, 
  email, 
  className, 
  showPhone = true, 
  showEmail = false 
}: ContactInfoProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="font-medium text-gray-900">{name}</div>
      {showPhone && phone && (
        <div className="text-sm text-gray-500">{phone}</div>
      )}
      {showEmail && email && (
        <div className="text-sm text-gray-500">{email}</div>
      )}
    </div>
  )
}
