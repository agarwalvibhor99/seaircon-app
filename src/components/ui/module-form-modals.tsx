'use client'

import React from 'react'
import { User, Building, FileText, Receipt, Calendar, Wrench, DollarSign, Users, MapPin } from 'lucide-react'
import { FormModal } from './form-modal'

// Module-specific form modals with predefined styling
interface ModuleFormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  className?: string
}

// Leads Module
export function LeadsFormModal(props: ModuleFormModalProps) {
  return (
    <FormModal
      {...props}
      icon={<User className="h-6 w-6" />}
      gradientFrom="from-cyan-500"
      gradientTo="to-blue-500"
    />
  )
}

// Projects Module
export function ProjectsFormModal(props: ModuleFormModalProps) {
  return (
    <FormModal
      {...props}
      icon={<Building className="h-6 w-6" />}
      gradientFrom="from-green-500"
      gradientTo="to-teal-500"
    />
  )
}

// Quotations Module
export function QuotationsFormModal(props: ModuleFormModalProps) {
  return (
    <FormModal
      {...props}
      icon={<FileText className="h-6 w-6" />}
      gradientFrom="from-purple-500"
      gradientTo="to-indigo-500"
    />
  )
}

// Invoices Module
export function InvoicesFormModal(props: ModuleFormModalProps) {
  return (
    <FormModal
      {...props}
      icon={<Receipt className="h-6 w-6" />}
      gradientFrom="from-blue-500"
      gradientTo="to-cyan-500"
    />
  )
}

// Payments Module
export function PaymentsFormModal(props: ModuleFormModalProps) {
  return (
    <FormModal
      {...props}
      icon={<DollarSign className="h-6 w-6" />}
      gradientFrom="from-green-500"
      gradientTo="to-emerald-500"
    />
  )
}

// Employees Module
export function EmployeesFormModal(props: ModuleFormModalProps) {
  return (
    <FormModal
      {...props}
      icon={<Users className="h-6 w-6" />}
      gradientFrom="from-indigo-500"
      gradientTo="to-purple-500"
    />
  )
}

// Site Visits Module
export function SiteVisitsFormModal(props: ModuleFormModalProps) {
  return (
    <FormModal
      {...props}
      icon={<MapPin className="h-6 w-6" />}
      gradientFrom="from-orange-500"
      gradientTo="to-red-500"
    />
  )
}

// Installations Module
export function InstallationsFormModal(props: ModuleFormModalProps) {
  return (
    <FormModal
      {...props}
      icon={<Wrench className="h-6 w-6" />}
      gradientFrom="from-emerald-500"
      gradientTo="to-green-500"
    />
  )
}

// AMC Module
export function AMCFormModal(props: ModuleFormModalProps) {
  return (
    <FormModal
      {...props}
      icon={<Calendar className="h-6 w-6" />}
      gradientFrom="from-amber-500"
      gradientTo="to-orange-500"
    />
  )
}

export default {
  LeadsFormModal,
  ProjectsFormModal,
  QuotationsFormModal,
  InvoicesFormModal,
  PaymentsFormModal,
  EmployeesFormModal,
  SiteVisitsFormModal,
  InstallationsFormModal,
  AMCFormModal
}
