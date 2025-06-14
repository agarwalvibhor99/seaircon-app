// Simple toast system - shows only one toast at a time
let currentToast: HTMLElement | null = null;

function removeCurrentToast() {
  if (currentToast) {
    currentToast.remove();
    currentToast = null;
  }
}

function createToast(message: string, description?: string, type: 'success' | 'error' = 'success') {
  // Remove any existing toast first
  removeCurrentToast();

  // Only run in browser
  if (typeof window === 'undefined') return;

  const isSuccess = type === 'success';
  const borderColor = isSuccess ? '#10b981' : '#ef4444';
  const iconColor = isSuccess ? '#10b981' : '#ef4444';
  const icon = isSuccess ? '✓' : '✗';

  // Create toast element
  const toastEl = document.createElement('div');
  toastEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #e5e7eb;
    border-left: 4px solid ${borderColor};
    border-radius: 8px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    padding: 16px;
    max-width: 400px;
    z-index: 9999;
    font-family: system-ui, -apple-system, sans-serif;
    backdrop-filter: blur(8px);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    cursor: pointer;
  `;

  // Add content
  toastEl.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="color: ${iconColor}; font-size: 20px;">${icon}</div>
      <div>
        <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${message}</div>
        ${description ? `<div style="font-size: 14px; color: #6b7280;">${description}</div>` : ''}
      </div>
    </div>
  `;

  // Add to page
  document.body.appendChild(toastEl);
  currentToast = toastEl;

  // Animate in
  setTimeout(() => {
    toastEl.style.transform = 'translateX(0)';
  }, 10);

  // Auto remove after duration
  const duration = isSuccess ? 4000 : 6000;
  setTimeout(() => {
    if (currentToast === toastEl) {
      toastEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.remove();
        }
        if (currentToast === toastEl) {
          currentToast = null;
        }
      }, 300);
    }
  }, duration);

  // Click to dismiss
  toastEl.addEventListener('click', () => {
    if (currentToast === toastEl) {
      toastEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.remove();
        }
        currentToast = null;
      }, 300);
    }
  });
}

// Export simple interface
export const notify = {
  success: (message: string, description?: string) => {
    console.log('🎉 SUCCESS TOAST CALLED:', message, description);
    createToast(message, description, 'success');
  },
  
  error: (message: string, description?: string) => {
    console.log('❌ ERROR TOAST CALLED:', message, description);
    createToast(message, description, 'error');
  },
  
  warning: (message: string, description?: string) => {
    console.log('⚠️ WARNING TOAST CALLED:', message, description);
    createToast(message, description, 'error'); // Use error styling for warnings
  },
  
  loading: (message: string, description?: string) => {
    console.log('🔄 LOADING TOAST CALLED:', message, description);
    createToast(message, description, 'success'); // Use success styling for loading
    return 'loading-toast-id'; // Return dummy ID for compatibility
  }
};
