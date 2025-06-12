// Simple toast notification system using React context and DOM manipulation
export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
  duration?: number
}

class ToastManager {
  private toasts: Map<string, HTMLElement> = new Map()
  private container: HTMLElement | null = null

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.id = 'toast-container'
      this.container.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        pointer-events: none;
      `
      document.body.appendChild(this.container)
    }
  }

  private createToast(options: ToastOptions): string {
    const id = Math.random().toString(36).substr(2, 9)
    const toast = document.createElement('div')
    
    const bgColors = {
      success: 'bg-green-50 border-green-200 text-green-900',
      error: 'bg-red-50 border-red-200 text-red-900', 
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      info: 'bg-blue-50 border-blue-200 text-blue-900'
    }

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    }

    toast.className = `
      ${bgColors[options.type]}
      border rounded-lg p-4 shadow-lg pointer-events-auto max-w-sm
      transform transition-all duration-300 ease-in-out
      translate-x-full opacity-0
    `.replace(/\s+/g, ' ').trim()

    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0 text-lg">${icons[options.type]}</div>
        <div class="flex-1">
          <div class="font-medium">${options.message}</div>
          ${options.description ? `<div class="text-sm opacity-80 mt-1">${options.description}</div>` : ''}
        </div>
        <button class="flex-shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `

    this.ensureContainer()
    this.container!.appendChild(toast)
    this.toasts.set(id, toast)

    // Trigger animation
    setTimeout(() => {
      toast.style.transform = 'translateX(0)'
      toast.style.opacity = '1'
    }, 10)

    // Auto remove
    setTimeout(() => {
      this.dismiss(id)
    }, options.duration || 4000)

    return id
  }

  show(options: ToastOptions): string {
    return this.createToast(options)
  }

  dismiss(id: string) {
    const toast = this.toasts.get(id)
    if (toast) {
      toast.style.transform = 'translateX(100%)'
      toast.style.opacity = '0'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
        this.toasts.delete(id)
      }, 300)
    }
  }

  dismissAll() {
    this.toasts.forEach((_, id) => this.dismiss(id))
  }
}

const toastManager = new ToastManager()

// Toast utility functions with consistent styling
export const showToast = {
  success: (message: string, description?: string) => {
    return toastManager.show({ type: 'success', message, description })
  },

  error: (message: string, description?: string) => {
    return toastManager.show({ type: 'error', message, description })
  },

  warning: (message: string, description?: string) => {
    return toastManager.show({ type: 'warning', message, description })
  },

  info: (message: string, description?: string) => {
    return toastManager.show({ type: 'info', message, description })
  },

  loading: (message: string, description?: string) => {
    // For loading, we'll use info style with a longer duration
    return toastManager.show({ type: 'info', message, description, duration: 0 }) // 0 = manual dismiss
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toastManager.dismiss(toastId)
    }
  },

  dismissAll: () => {
    toastManager.dismissAll()
  },

  custom: (message: string, options?: {
    description?: string
    duration?: number
  }) => {
    return toastManager.show({ 
      type: 'info', 
      message, 
      description: options?.description,
      duration: options?.duration 
    })
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    const loadingId = showToast.loading(loading)
    
    promise
      .then((data) => {
        showToast.dismiss(loadingId)
        const successMsg = typeof success === 'function' ? success(data) : success
        showToast.success(successMsg)
      })
      .catch((err) => {
        showToast.dismiss(loadingId)
        const errorMsg = typeof error === 'function' ? error(err) : error
        showToast.error(errorMsg)
      })
  },
}

// Export individual functions for convenience
export const {
  success: toastSuccess,
  error: toastError,
  warning: toastWarning,
  info: toastInfo,
  loading: toastLoading,
  dismiss: toastDismiss,
  dismissAll: toastDismissAll,
  custom: toastCustom,
  promise: toastPromise,
} = showToast

export default showToast
