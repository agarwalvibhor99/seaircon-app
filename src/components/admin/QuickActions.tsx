import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function QuickActions() {
  const actions = [
    {
      title: 'Add New Lead',
      description: 'Create a new consultation request',
      href: '/admin/leads/new',
      icon: '👤',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: 'Schedule Site Visit',
      description: 'Book a site assessment',
      href: '/admin/site-visits/schedule',
      icon: '📅',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      title: 'Create Quotation',
      description: 'Generate new quotation',
      href: '/admin/quotations/create',
      icon: '📄',
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    },
    {
      title: 'New Invoice',
      description: 'Create invoice for payment',
      href: '/admin/invoicing',
      icon: '💰',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {actions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${action.color}`}>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{action.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full">
                📊 View Reports
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full">
                ⚙️ Settings
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
