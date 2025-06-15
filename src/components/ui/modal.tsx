'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Eye, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  className?: string
}

interface ViewModalProps extends Omit<ModalProps, 'children'> {
  data: Record<string, any>
  fields: Array<{
    key: string
    label: string
    render?: (value: any, data: Record<string, any>) => React.ReactNode
    className?: string
  }>
  actions?: Array<{
    label: string
    onClick: () => void
    icon?: React.ReactNode
    variant?: 'default' | 'outline' | 'ghost' | 'destructive'
    className?: string
  }>
}

interface ActionButtonsProps {
  actions: Array<{
    label: string
    onClick: () => void
    icon?: React.ReactNode
    variant?: 'default' | 'outline' | 'ghost' | 'destructive'
    className?: string
  }>
  onClose: () => void
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
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl'
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
  className = ''
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(maxWidthClasses[maxWidth], 'max-h-[90vh] overflow-y-auto', className)}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">{title}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ViewModal({
  isOpen,
  onClose,
  title,
  data,
  fields,
  actions = [],
  maxWidth = 'lg',
  className = ''
}: ViewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
      className={className}
    >
      <div className="space-y-6">
        {/* Field sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field, index) => (
            <div key={field.key} className={cn('space-y-2', field.className)}>
              <label className="text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <div className="text-sm text-gray-900">
                {field.render
                  ? field.render(data[field.key], data)
                  : data[field.key] || '—'
                }
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <ActionButtons
            actions={actions}
            onClose={onClose}
            className="pt-4 border-t"
          />
        )}
      </div>
    </Modal>
  )
}

export function ActionButtons({
  actions,
  onClose,
  className = ''
}: ActionButtonsProps) {
  return (
    <div className={cn('flex flex-wrap gap-3 justify-end', className)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'outline'}
          onClick={action.onClick}
          className={cn('flex items-center gap-2', action.className)}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
      <Button variant="ghost" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}

// Common action button configurations
export const commonActions = {
  view: (onClick: () => void) => ({
    label: 'View Details',
    onClick,
    icon: <Eye className="h-4 w-4" />,
    variant: 'outline' as const
  }),
  edit: (onClick: () => void) => ({
    label: 'Edit',
    onClick,
    icon: <Edit className="h-4 w-4" />,
    variant: 'default' as const
  }),
  delete: (onClick: () => void) => ({
    label: 'Delete',
    onClick,
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive' as const
  })
}

export default Modal
