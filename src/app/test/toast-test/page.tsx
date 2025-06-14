'use client'

import { Button } from '@/components/ui/button'
import { notify } from '@/lib/toast'

export default function ToastTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-8">Toast System Test</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Single Toast Test</h2>
              <p className="text-gray-600 mb-4">
                These buttons test that only one toast appears at a time, even when clicked rapidly.
              </p>
              <div className="space-x-4">
                <Button 
                  onClick={() => notify.success('Success!', 'This is a success message')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Show Success Toast
                </Button>
                <Button 
                  onClick={() => notify.error('Error!', 'This is an error message')}
                  variant="destructive"
                >
                  Show Error Toast
                </Button>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Rapid Click Test</h2>
              <p className="text-gray-600 mb-4">
                Click this button rapidly multiple times - only the last toast should be visible.
              </p>
              <Button 
                onClick={() => notify.success('Rapid Toast', `Clicked at ${new Date().toLocaleTimeString()}`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Rapid Test Toast
              </Button>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
              <p className="text-gray-600 mb-4">
                Go to <a href="/admin/leads/new" className="text-blue-600 underline">/admin/leads/new</a> and create a lead.
                Only ONE success toast should appear before redirect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
