import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  contact_type: string
  contact_date: string
  summary: string
  consultation_requests?: { name: string } | null
  customers?: { name: string } | null
}

interface RecentActivityProps {
  activities: Activity[]
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return '📞'
      case 'email':
        return '📧'
      case 'whatsapp':
        return '💬'
      case 'visit':
        return '🏠'
      default:
        return '📝'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="text-2xl">{getActivityIcon(activity.contact_type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.consultation_requests?.name || activity.customers?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {activity.summary || `${activity.contact_type} contact`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(activity.contact_date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
