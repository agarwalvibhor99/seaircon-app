'use client'

import StandardizedStats from '@/components/ui/standardized-stats'
import { Calendar, Clock, CheckCircle, AlertTriangle, MapPin } from 'lucide-react'

interface SiteVisit {
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  visit_date: string
}

interface SiteVisitsStatsProps {
  visits: SiteVisit[]
}

export default function SiteVisitsStats({ visits }: SiteVisitsStatsProps) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const stats = {
    totalVisits: visits.length,
    scheduled: visits.filter(v => v.status === 'scheduled').length,
    todayVisits: visits.filter(v => v.visit_date.split('T')[0] === todayStr).length,
    completed: visits.filter(v => v.status === 'completed').length,
    inProgress: visits.filter(v => v.status === 'in_progress').length,
    completionRate: visits.length > 0 
      ? ((visits.filter(v => v.status === 'completed').length / visits.length) * 100).toFixed(1)
      : '0'
  }

  const statCards = [
    { 
      title: 'Total Visits', 
      value: stats.totalVisits, 
      icon: Calendar, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Scheduled', 
      value: stats.scheduled, 
      subtitle: 'Upcoming visits',
      icon: Clock, 
      color: 'text-orange-600' 
    },
    { 
      title: 'Today', 
      value: stats.todayVisits, 
      subtitle: 'Visits today',
      icon: MapPin, 
      color: 'text-purple-600' 
    },
    { 
      title: 'In Progress', 
      value: stats.inProgress, 
      subtitle: 'Active visits',
      icon: AlertTriangle, 
      color: 'text-yellow-600' 
    },
    { 
      title: 'Completed', 
      value: stats.completed, 
      subtitle: `${stats.completionRate}% completion`,
      icon: CheckCircle, 
      color: 'text-green-600' 
    }
  ]

  return <StandardizedStats stats={statCards} columns={5} />
}
