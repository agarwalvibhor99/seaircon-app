'use client'

import React from 'react'
import { showToast } from '@/lib/toast.service'
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export default function ToastDemo() {
  const demoToasts = [
    {
      type: 'success',
      title: 'Success Toast',
      description: 'This is a success message with green styling',
      action: () => showToast.success('Operation completed successfully!', 'Your data has been saved.')
    },
    {
      type: 'error',
      title: 'Error Toast',
      description: 'This is an error message with red styling',
      action: () => showToast.error('Something went wrong!', 'Please check your input and try again.')
    },
    {
      type: 'warning',
      title: 'Warning Toast',
      description: 'This is a warning message with yellow styling',
      action: () => showToast.warning('Warning: Please review your changes', 'Some fields may need attention.')
    },
    {
      type: 'info',
      title: 'Info Toast',
      description: 'This is an info message with blue styling',
      action: () => showToast.info('Information updated', 'Your preferences have been updated.')
    },
    {
      type: 'loading',
      title: 'Loading Toast',
      description: 'This shows a loading spinner',
      action: () => {
        const loadingToast = showToast.loading('Processing...', 'Please wait while we save your data')
        setTimeout(() => {
          showToast.dismiss(loadingToast)
          showToast.success('Completed!', 'Your data has been processed successfully.')
        }, 3000)
      }
    },
    {
      type: 'custom',
      title: 'Custom Toast',
      description: 'This is a custom styled toast',
      action: () => showToast.custom('Custom notification', {
        description: 'This is a custom toast with extended duration',
        duration: 6000
      })
    },
    {
      type: 'promise',
      title: 'Promise Toast',
      description: 'This demonstrates async operations',
      action: () => {
        const fakeApiCall = new Promise((resolve, reject) => {
          setTimeout(() => {
            Math.random() > 0.5 ? resolve('Success!') : reject('Failed!')
          }, 2000)
        })

        showToast.promise(fakeApiCall, {
          loading: 'Saving data...',
          success: 'Data saved successfully!',
          error: 'Failed to save data. Please try again.'
        })
      }
    }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info': return <Info className="h-5 w-5 text-blue-600" />
      default: return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Toast Notification Demo</h1>
        <p className="text-gray-600">
          Test the new toast notification system with various types and styles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoToasts.map((toast, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              {getIcon(toast.type)}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{toast.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{toast.description}</p>
                <button
                  onClick={toast.action}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Show {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)} Toast
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Toast Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Styling Features</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Consistent color schemes for each type</li>
              <li>• Icons that match the message type</li>
              <li>• Smooth animations and transitions</li>
              <li>• Close button for manual dismissal</li>
              <li>• Responsive design for all screen sizes</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Functional Features</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Auto-dismiss after 4 seconds</li>
              <li>• Action buttons for user interaction</li>
              <li>• Promise-based toasts for async operations</li>
              <li>• Loading states with spinners</li>
              <li>• Multiple toast stacking</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => showToast.dismissAll()}
          className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
        >
          Dismiss All Toasts
        </button>
        <button
          onClick={() => {
            // Show multiple toasts at once
            showToast.success('First toast')
            setTimeout(() => showToast.warning('Second toast'), 500)
            setTimeout(() => showToast.info('Third toast'), 1000)
            setTimeout(() => showToast.error('Fourth toast'), 1500)
          }}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
        >
          Show Multiple Toasts
        </button>
      </div>
    </div>
  )
}
