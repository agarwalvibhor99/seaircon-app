'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Receipt, 
  CreditCard, 
  Activity,
  Plus,
  Clock,
  User,
  Calendar,
  MessageSquare,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { Project, ProjectActivity } from '@/lib/enhanced-types-new'

interface ProjectActivityTimelineEnhancedProps {
  project: Project
}

const activityTypeIcons: { [key: string]: any } = {
  quote_created: FileText,
  quote_sent: FileText,
  quote_approved: CheckCircle,
  quote_rejected: AlertCircle,
  invoice_created: Receipt,
  invoice_sent: Receipt,
  payment_received: CreditCard,
  status_changed: Activity,
  project_created: Plus,
  project_updated: Activity,
  note_added: MessageSquare,
  file_uploaded: Upload
}

const activityTypeColors: { [key: string]: string } = {
  quote_created: 'bg-blue-100 text-blue-800',
  quote_sent: 'bg-purple-100 text-purple-800',
  quote_approved: 'bg-green-100 text-green-800',
  quote_rejected: 'bg-red-100 text-red-800',
  invoice_created: 'bg-orange-100 text-orange-800',
  invoice_sent: 'bg-indigo-100 text-indigo-800',
  payment_received: 'bg-green-100 text-green-800',
  status_changed: 'bg-cyan-100 text-cyan-800',
  project_created: 'bg-emerald-100 text-emerald-800',
  project_updated: 'bg-yellow-100 text-yellow-800',
  note_added: 'bg-gray-100 text-gray-800',
  file_uploaded: 'bg-pink-100 text-pink-800'
}

export default function ProjectActivityTimelineEnhanced({ project }: ProjectActivityTimelineEnhancedProps) {
  const [activities, setActivities] = useState<ProjectActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadActivities()
  }, [project.id])

  const loadActivities = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('project_activities')
        .select(`
          *,
          performed_by_employee:employees!project_activities_performed_by_fkey(full_name, role)
        `)
        .eq('project_id', project.id)
        .order('performed_at', { ascending: false })

      if (error) throw error
      
      setActivities(data || [])
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} days ago`
    } else {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getActivityIcon = (activityType: string) => {
    const IconComponent = activityTypeIcons[activityType] || Activity
    return IconComponent
  }

  const getActivityMetadata = (activity: ProjectActivity) => {
    if (!activity.metadata) return null

    const metadata = typeof activity.metadata === 'string' 
      ? JSON.parse(activity.metadata) 
      : activity.metadata

    return metadata
  }

  const renderActivityDetails = (activity: ProjectActivity) => {
    const metadata = getActivityMetadata(activity)
    
    switch (activity.activity_type) {
      case 'quote_created':
      case 'quote_sent':
      case 'quote_approved':
      case 'quote_rejected':
        return (
          <div className="mt-2 space-y-1">
            {metadata?.quote_number && (
              <p className="text-sm text-gray-600">Quote: {metadata.quote_number}</p>
            )}
            {metadata?.amount && (
              <p className="text-sm text-gray-600">Amount: {formatCurrency(metadata.amount)}</p>
            )}
            {metadata?.version && (
              <p className="text-sm text-gray-600">Version: {metadata.version}</p>
            )}
          </div>
        )
      
      case 'invoice_created':
      case 'invoice_sent':
        return (
          <div className="mt-2 space-y-1">
            {metadata?.invoice_number && (
              <p className="text-sm text-gray-600">Invoice: {metadata.invoice_number}</p>
            )}
            {metadata?.amount && (
              <p className="text-sm text-gray-600">Amount: {formatCurrency(metadata.amount)}</p>
            )}
            {metadata?.due_date && (
              <p className="text-sm text-gray-600">Due: {formatDate(metadata.due_date)}</p>
            )}
          </div>
        )
      
      case 'payment_received':
        return (
          <div className="mt-2 space-y-1">
            {metadata?.payment_reference && (
              <p className="text-sm text-gray-600">Reference: {metadata.payment_reference}</p>
            )}
            {metadata?.amount && (
              <p className="text-sm text-green-600 font-medium">Amount: {formatCurrency(metadata.amount)}</p>
            )}
            {metadata?.payment_mode && (
              <p className="text-sm text-gray-600">Mode: {metadata.payment_mode}</p>
            )}
            {metadata?.is_partial && (
              <Badge variant="outline" className="text-xs text-orange-600">Partial Payment</Badge>
            )}
          </div>
        )
      
      case 'status_changed':
        return (
          <div className="mt-2 space-y-1">
            {metadata?.old_status && metadata?.new_status && (
              <p className="text-sm text-gray-600">
                Changed from <span className="font-medium">{metadata.old_status}</span> to{' '}
                <span className="font-medium">{metadata.new_status}</span>
              </p>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2 text-cyan-600" />
              Activity Timeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Activities</option>
                <option value="quote">Quotes</option>
                <option value="invoice">Invoices</option>
                <option value="payment">Payments</option>
                <option value="project">Project</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'No activities have been recorded for this project yet.' 
                  : `No ${filter} activities found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200"></div>
            
            {filteredActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.activity_type)
              const isLast = index === filteredActivities.length - 1
              
              return (
                <div key={activity.id} className="relative flex items-start gap-4 pb-6">
                  {/* Timeline icon */}
                  <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 border-white shadow-lg ${
                    activityTypeColors[activity.activity_type] || 'bg-gray-100 text-gray-800'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  {/* Activity content */}
                  <div className="flex-1 min-w-0">
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                            <p className="text-gray-700">{activity.description}</p>
                            {renderActivityDetails(activity)}
                          </div>
                          <div className="ml-4 flex-shrink-0 text-right">
                            <Badge className={activityTypeColors[activity.activity_type] || 'bg-gray-100 text-gray-800'}>
                              {activity.activity_type.replace('_', ' ')}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(activity.performed_at)}</p>
                          </div>
                        </div>
                        
                        {/* Performer info */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {activity.performed_by_employee?.full_name || 'System'}
                          </span>
                          {activity.performed_by_employee?.role && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{activity.performed_by_employee.role}</span>
                            </>
                          )}
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-500">
                            {new Date(activity.performed_at).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Activity Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activities.filter(a => a.type === 'quote').length}
              </div>
              <div className="text-sm text-gray-600">Quote Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activities.filter(a => a.type === 'invoice').length}
              </div>
              <div className="text-sm text-gray-600">Invoice Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {activities.filter(a => a.type === 'payment').length}
              </div>
              <div className="text-sm text-gray-600">Payment Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {activities.filter(a => a.type === 'project').length}
              </div>
              <div className="text-sm text-gray-600">Project Updates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
