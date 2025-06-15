/**
 * SE Aircon CRM Design System
 * 
 * Centralized configuration for colors, spacing, typography, and component styles
 * to ensure consistency across the entire application.
 */

// Status configurations used across modules
export const statusConfigs = {
  // Lead statuses
  leads: {
    new: { color: 'bg-blue-100 text-blue-800', label: 'New' },
    contacted: { color: 'bg-cyan-100 text-cyan-800', label: 'Contacted' },
    qualified: { color: 'bg-purple-100 text-purple-800', label: 'Qualified' },
    proposal_sent: { color: 'bg-orange-100 text-orange-800', label: 'Proposal Sent' },
    negotiation: { color: 'bg-yellow-100 text-yellow-800', label: 'Negotiation' },
    won: { color: 'bg-green-100 text-green-800', label: 'Won' },
    lost: { color: 'bg-red-100 text-red-800', label: 'Lost' },
    follow_up: { color: 'bg-gray-100 text-gray-800', label: 'Follow-up' },
    converted: { color: 'bg-green-100 text-green-800', label: 'Converted' },
    active: { color: 'bg-blue-100 text-blue-800', label: 'Active' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
  },

  // Project statuses
  projects: {
    draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
    planning: { color: 'bg-blue-100 text-blue-800', label: 'Planning' },
    approved: { color: 'bg-cyan-100 text-cyan-800', label: 'Approved' },
    in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
    on_hold: { color: 'bg-orange-100 text-orange-800', label: 'On Hold' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
  },

  // Employee statuses
  employees: {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
    on_leave: { color: 'bg-yellow-100 text-yellow-800', label: 'On Leave' },
    terminated: { color: 'bg-red-100 text-red-800', label: 'Terminated' }
  },

  // Site visit statuses
  siteVisits: {
    scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
    in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    rescheduled: { color: 'bg-orange-100 text-orange-800', label: 'Rescheduled' }
  },

  // Quotation statuses
  quotations: {
    draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
    approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    expired: { color: 'bg-orange-100 text-orange-800', label: 'Expired' },
    revised: { color: 'bg-purple-100 text-purple-800', label: 'Revised' }
  },

  // Invoice statuses
  invoices: {
    draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
    paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
    overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue' },
    partially_paid: { color: 'bg-yellow-100 text-yellow-800', label: 'Partially Paid' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
  },

  // Payment statuses
  payments: {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    refunded: { color: 'bg-purple-100 text-purple-800', label: 'Refunded' }
  },

  // Installation statuses
  installations: {
    scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
    in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    on_hold: { color: 'bg-orange-100 text-orange-800', label: 'On Hold' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
  },

  // AMC statuses
  amc: {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    expired: { color: 'bg-red-100 text-red-800', label: 'Expired' },
    pending_renewal: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Renewal' },
    cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
    suspended: { color: 'bg-orange-100 text-orange-800', label: 'Suspended' }
  }
}

// Priority configurations
export const priorityConfigs = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
  emergency: { color: 'bg-red-100 text-red-800', label: 'Emergency' }
}

// Urgency configurations
export const urgencyConfigs = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  emergency: { color: 'bg-red-100 text-red-800', label: 'Emergency' }
}

// Role configurations for employees
export const roleConfigs = {
  admin: { color: 'bg-red-100 text-red-800', label: 'Admin' },
  manager: { color: 'bg-purple-100 text-purple-800', label: 'Manager' },
  supervisor: { color: 'bg-blue-100 text-blue-800', label: 'Supervisor' },
  technician: { color: 'bg-green-100 text-green-800', label: 'Technician' },
  sales: { color: 'bg-cyan-100 text-cyan-800', label: 'Sales' },
  support: { color: 'bg-orange-100 text-orange-800', label: 'Support' },
  accountant: { color: 'bg-yellow-100 text-yellow-800', label: 'Accountant' },
  engineer: { color: 'bg-indigo-100 text-indigo-800', label: 'Engineer' }
}

// Button style configurations
export const buttonStyles = {
  primary: 'bg-gray-900 hover:bg-gray-800 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-orange-600 hover:bg-orange-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700'
}

// Card style configurations
export const cardStyles = {
  default: 'bg-white rounded-lg border border-gray-200 shadow-sm',
  elevated: 'bg-white rounded-lg border border-gray-200 shadow-lg',
  interactive: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
}

// Color system for consistent theming
export const colors = {
  primary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  }
}

// Typography scale
export const typography = {
  h1: 'text-3xl font-bold text-gray-900',
  h2: 'text-2xl font-bold text-gray-900',
  h3: 'text-xl font-semibold text-gray-900',
  h4: 'text-lg font-semibold text-gray-900',
  h5: 'text-base font-semibold text-gray-900',
  body: 'text-sm text-gray-900',
  caption: 'text-xs text-gray-600',
  label: 'text-sm font-medium text-gray-700'
}

// Spacing scale (for margin, padding, etc.)
export const spacing = {
  xs: '0.5rem',  // 8px
  sm: '0.75rem', // 12px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem'  // 64px
}

// Helper function to get status configuration
export function getStatusConfig(module: string, status: string) {
  const moduleConfig = statusConfigs[module as keyof typeof statusConfigs]
  if (!moduleConfig) return { color: 'bg-gray-100 text-gray-800', label: status }
  
  return moduleConfig[status as keyof typeof moduleConfig] || { color: 'bg-gray-100 text-gray-800', label: status }
}

// Helper function to format currency consistently
export function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper function to format dates consistently
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

// Helper function to format relative time
export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(date)
}

export default {
  statusConfigs,
  priorityConfigs,
  urgencyConfigs,
  roleConfigs,
  buttonStyles,
  cardStyles,
  colors,
  typography,
  spacing,
  getStatusConfig,
  formatCurrency,
  formatDate,
  formatRelativeTime
}
