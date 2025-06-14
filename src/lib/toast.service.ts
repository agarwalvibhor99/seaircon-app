// DEPRECATED: Use notify.ts instead
// This file is kept for compatibility but redirects to simple toast

import { toast } from './simple-toast'

export interface ToastOptions {
  description?: string
  duration?: number
}

// Legacy compatibility - redirects to simple toast
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, options?.description)
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, options?.description)
  },

  // Deprecated methods that do nothing
  warning: () => {},
  info: () => {},
  loading: () => {},
  dismiss: () => {},
  dismissAll: () => {},
  custom: () => {},
  promise: () => {}
}

export default showToast
