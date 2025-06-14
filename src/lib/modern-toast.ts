// Modern Toast Notification System
// Sleek, animated toast notifications with modern styling

export interface ToastOptions {
  description?: string
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  style?: 'default' | 'minimal' | 'glass'
}

interface ToastData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  message: string
  description?: string
  duration: number
  timestamp: number
}

class ModernToastManager {
  private toasts: Map<string, ToastData> = new Map()
  private container: HTMLElement | null = null
  private isInitialized = false

  private ensureContainer(position: string = 'top-right') {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }
    
    if (!this.container || !document.body.contains(this.container)) {
      // Remove any existing containers
      const existingContainers = document.querySelectorAll('.modern-toast-container')
      existingContainers.forEach(container => container.remove())

      this.container = document.createElement('div')
      this.container.className = 'modern-toast-container'
      this.container.setAttribute('data-position', position)
      
      const positions = {
        'top-right': 'top: 1rem; right: 1rem;',
        'top-left': 'top: 1rem; left: 1rem;', 
        'bottom-right': 'bottom: 1rem; right: 1rem;',
        'bottom-left': 'bottom: 1rem; left: 1rem;',
        'top-center': 'top: 1rem; left: 50%; transform: translateX(-50%);',
        'bottom-center': 'bottom: 1rem; left: 50%; transform: translateX(-50%);'
      }

      this.container.style.cssText = `
        position: fixed;
        ${positions[position as keyof typeof positions] || positions['top-right']}
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
        max-width: 420px;
        min-width: 300px;
      `
      
      document.body.appendChild(this.container)
      this.isInitialized = true
    }
  }

  private createToastElement(toastData: ToastData, style: string = 'default'): HTMLElement {
    // Ensure we're in browser environment  
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return document.createElement('div') // fallback
    }
    
    const toast = document.createElement('div')
    toast.id = `toast-${toastData.id}`
    toast.setAttribute('data-toast-id', toastData.id)
    
    // Base styles for all toasts using CSS properties
    toast.style.cssText = `
      pointer-events: auto;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transform: translateX(100%) scale(0.95);
      opacity: 0;
      transition: all 0.3s ease-out;
      min-width: 300px;
      max-width: 420px;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      backdrop-filter: blur(16px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `

    // Style variations
    if (style === 'glass') {
      toast.style.background = 'rgba(255, 255, 255, 0.8)'
      toast.style.borderColor = 'rgba(255, 255, 255, 0.2)'
      toast.style.border = '1px solid rgba(255, 255, 255, 0.2)'
    } else if (style === 'minimal') {
      toast.style.background = '#1f2937'
      toast.style.color = '#ffffff'
    } else {
      toast.style.background = '#ffffff'
      toast.style.border = '1px solid #e5e7eb'
    }

    // Type-specific colors and icons
    const typeStyles = {
      success: {
        borderColor: '#10b981',
        iconColor: '#10b981',
        icon: `
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        `
      },
      error: {
        borderColor: '#ef4444',
        iconColor: '#ef4444',
        icon: `
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        `
      },
      warning: {
        borderColor: '#f59e0b',
        iconColor: '#f59e0b',
        icon: `
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        `
      },
      info: {
        borderColor: '#3b82f6',
        iconColor: '#3b82f6',
        icon: `
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        `
      },
      loading: {
        borderColor: '#6b7280',
        iconColor: '#6b7280',
        icon: `
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle>
            <path fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style="opacity: 0.75;"></path>
          </svg>
        `
      }
    }

    const typeStyle = typeStyles[toastData.type]
    
    // Add accent border
    toast.style.borderLeft = `4px solid ${typeStyle.borderColor}`
    
    // Create content
    const textColor = style === 'minimal' ? '#ffffff' : '#111827'
    const descColor = style === 'minimal' ? '#d1d5db' : '#6b7280'

    toast.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="color: ${typeStyle.iconColor}; flex-shrink: 0; margin-top: 2px;">
          ${typeStyle.icon}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; color: ${textColor}; font-size: 14px; line-height: 20px;">
            ${toastData.message}
          </div>
          ${toastData.description ? `
            <div style="color: ${descColor}; font-size: 13px; line-height: 18px; margin-top: 4px;">
              ${toastData.description}
            </div>
          ` : ''}
        </div>
        <button 
          onclick="window.modernToast?.dismiss('${toastData.id}')"
          style="
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: none;
            background: transparent;
            color: ${style === 'minimal' ? '#9ca3af' : '#6b7280'};
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          "
          onmouseover="this.style.background='rgba(0,0,0,0.1)'"
          onmouseout="this.style.background='transparent'"
          aria-label="Close notification"
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `

    // Add spin animation for loading
    if (toastData.type === 'loading') {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `
      document.head.appendChild(style)
    }

    // Add click handler to dismiss
    toast.addEventListener('click', () => {
      this.dismiss(toastData.id)
    })

    return toast
  }

  private show(type: ToastData['type'], message: string, options: ToastOptions = {}): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Early return if not in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return id
    }
    
    // For success toasts, dismiss any existing toasts to prevent duplicates
    if (type === 'success') {
      this.dismissAll()
    }
    
    const duration = options.duration !== undefined ? options.duration : 
                    type === 'loading' ? 0 : 
                    type === 'error' ? 6000 : 4000

    const toastData: ToastData = {
      id,
      type,
      message,
      description: options.description,
      duration,
      timestamp: Date.now()
    }

    this.toasts.set(id, toastData)
    this.ensureContainer(options.position)

    if (!this.container) {
      console.warn('Toast container not available')
      return id
    }

    const toastElement = this.createToastElement(toastData, options.style)
    this.container.appendChild(toastElement)

    // Trigger animation
    requestAnimationFrame(() => {
      toastElement.style.transform = 'translateX(0) scale(1)'
      toastElement.style.opacity = '1'
    })

    // Auto dismiss if duration is set
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id)
      }, duration)
    }

    return id
  }

  success(message: string, options?: ToastOptions): string {
    return this.show('success', message, options)
  }

  error(message: string, options?: ToastOptions): string {
    return this.show('error', message, options)
  }

  warning(message: string, options?: ToastOptions): string {
    return this.show('warning', message, options)
  }

  info(message: string, options?: ToastOptions): string {
    return this.show('info', message, options)
  }

  loading(message: string, options?: ToastOptions): string {
    return this.show('loading', message, { ...options, duration: 0 })
  }

  dismiss(id: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }
    
    const toastElement = document.getElementById(`toast-${id}`)
    if (toastElement) {
      toastElement.style.transform = 'translateX(100%) scale(0.95)'
      toastElement.style.opacity = '0'
      
      setTimeout(() => {
        if (toastElement.parentNode) {
          toastElement.parentNode.removeChild(toastElement)
        }
        this.toasts.delete(id)
      }, 300)
    }
  }

  dismissAll(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }
    
    // Clear all toasts from memory
    this.toasts.clear()
    
    // Remove all toast elements from DOM
    const allToasts = document.querySelectorAll('[data-toast-id]')
    allToasts.forEach(toast => {
      toast.remove()
    })
  }

  // Utility methods
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
    options?: ToastOptions
  ): Promise<T> {
    const loadingId = this.loading(messages.loading, options)
    
    return promise
      .then((data) => {
        this.dismiss(loadingId)
        const successMsg = typeof messages.success === 'function' ? messages.success(data) : messages.success
        this.success(successMsg, options)
        return data
      })
      .catch((err) => {
        this.dismiss(loadingId)
        const errorMsg = typeof messages.error === 'function' ? messages.error(err) : messages.error
        this.error(errorMsg, options)
        throw err
      })
  }
}

// Create global instance
const modernToast = new ModernToastManager()

// Make available globally for close buttons (only in browser)
if (typeof window !== 'undefined') {
  ;(window as any).modernToast = modernToast
}

// Export the instance
export const toast = modernToast
export default modernToast
