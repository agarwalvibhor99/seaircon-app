// Simple, clean toast system - only shows one toast at a time
let currentToast: HTMLElement | null = null;

export const toast = {
  success: (message: string, description?: string) => {
    // Remove any existing toast
    if (currentToast) {
      currentToast.remove();
      currentToast = null;
    }

    // Only run in browser
    if (typeof window === 'undefined') return;

    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #e5e7eb;
      border-left: 4px solid #10b981;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      padding: 16px;
      max-width: 400px;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
      backdrop-filter: blur(8px);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    // Add content
    toastEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="color: #10b981; font-size: 20px;">✓</div>
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

    // Auto remove after 4 seconds
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
    }, 4000);

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
  },

  error: (message: string, description?: string) => {
    // Remove any existing toast
    if (currentToast) {
      currentToast.remove();
      currentToast = null;
    }

    // Only run in browser
    if (typeof window === 'undefined') return;

    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #e5e7eb;
      border-left: 4px solid #ef4444;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      padding: 16px;
      max-width: 400px;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
      backdrop-filter: blur(8px);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    // Add content
    toastEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="color: #ef4444; font-size: 20px;">✗</div>
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

    // Auto remove after 6 seconds (errors stay longer)
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
    }, 6000);

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
};
