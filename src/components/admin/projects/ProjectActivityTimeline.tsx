'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  Activity,
  Quote,
  Receipt,
  CreditCard
} from 'lucide-react'
import { ProjectActivity } from '@/lib/enhanced-types'

interface ProjectActivityTimelineProps {
  projectId: string
}

const activityIcons = {
  quote_created: Quote,
  quote_sent: FileText,
  quote_approved: CheckCircle,
  quote_rejected: XCircle,
  invoice_created: Receipt,
  invoice_sent: FileText,
  payment_received: CreditCard,
  status_changed: Activity,
  project_updated: FileText,
  task_completed: CheckCircle,
  note_added: FileText,
  file_uploaded: FileText,
  meeting_scheduled: Clock,
  other: Activity
}

const activityColors = {
  quote_created: 'bg-blue-100 text-blue-800',
  quote_sent: 'bg-purple-100 text-purple-800',
  quote_approved: 'bg-green-100 text-green-800',
  quote_rejected: 'bg-red-100 text-red-800',
  invoice_created: 'bg-orange-100 text-orange-800',
  invoice_sent: 'bg-indigo-100 text-indigo-800',
  payment_received: 'bg-emerald-100 text-emerald-800',
  status_changed: 'bg-yellow-100 text-yellow-800',
  project_updated: 'bg-cyan-100 text-cyan-800',
  task_completed: 'bg-green-100 text-green-800',
  note_added: 'bg-gray-100 text-gray-800',
  file_uploaded: 'bg-pink-100 text-pink-800',
  meeting_scheduled: 'bg-violet-100 text-violet-800',
  other: 'bg-slate-100 text-slate-800'
}

export default function ProjectActivityTimeline({ projectId }: ProjectActivityTimelineProps) {
  const [activities, setActivities] = useState<(ProjectActivity & { employee: { full_name: string } })[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchActivities()
  }, [projectId])

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('project_activities')
        .select(`
          *,
          employee:performed_by(full_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching project activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const getActivityIcon = (activityType: string) => {
    const IconComponent = activityIcons[activityType as keyof typeof activityIcons] || Activity
    return <IconComponent className="h-4 w-4" />
  }

  const getActivityColor = (activityType: string) => {
    return activityColors[activityType as keyof typeof activityColors] || activityColors.other
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Project Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Project Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activities recorded for this project yet.</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {activities.map((activity, index) => {
                    const { date, time } = formatDate(activity.created_at)
                    
                    return (
                      <div key={activity.id} className="relative flex items-start gap-4">
                        {/* Timeline dot */}
                        <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded-full">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        
                        {/* Activity content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getActivityColor(activity.activity_type)}>
                                  {activity.activity_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {date} at {time}
                                </span>
                              </div>
                              
                              <h4 className="font-medium text-gray-900 mb-1">
                                {activity.title}
                              </h4>
                              
                              {activity.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {activity.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <User className="h-3 w-3" />
                                <span>{activity.employee?.full_name || 'Unknown'}</span>
                                
                                {activity.entity_type && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize">{activity.entity_type}</span>
                                  </>
                                )}
                              </div>
                              
                              {/* Metadata display */}
                              {activity.metadata && typeof activity.metadata === 'object' && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                  <pre className="whitespace-pre-wrap font-mono">
                                    {JSON.stringify(activity.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
