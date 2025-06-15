'use client'

import StandardizedStats from '@/components/ui/standardized-stats'
import { Wrench, Clock, CheckCircle, AlertTriangle, BarChart3, Calendar } from 'lucide-react'

interface Installation {
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  progress_percentage: number
}

interface InstallationsStatsProps {
  installations: Installation[]
}

export default function InstallationsStats({ installations }: InstallationsStatsProps) {
  const stats = {
    total: installations.length,
    scheduled: installations.filter(i => i.status === 'scheduled').length,
    inProgress: installations.filter(i => i.status === 'in_progress').length,
    onHold: installations.filter(i => i.status === 'on_hold').length,
    completed: installations.filter(i => i.status === 'completed').length,
    cancelled: installations.filter(i => i.status === 'cancelled').length,
    averageProgress: installations.length > 0 
      ? Math.round(installations.reduce((sum, i) => sum + (i.progress_percentage || 0), 0) / installations.length)
      : 0,
    completionRate: installations.length > 0 
      ? ((installations.filter(i => i.status === 'completed').length / installations.length) * 100).toFixed(1)
      : '0'
  }

  const statCards = [
    { 
      title: 'Total Installations', 
      value: stats.total, 
      icon: Wrench, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Scheduled', 
      value: stats.scheduled, 
      subtitle: 'Upcoming',
      icon: Calendar, 
      color: 'text-purple-600' 
    },
    { 
      title: 'In Progress', 
      value: stats.inProgress, 
      subtitle: 'Active work',
      icon: Clock, 
      color: 'text-orange-600' 
    },
    { 
      title: 'Completed', 
      value: stats.completed, 
      subtitle: `${stats.completionRate}% success`,
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      title: 'Issues', 
      value: stats.onHold, 
      subtitle: `${stats.cancelled} cancelled`,
      icon: AlertTriangle, 
      color: 'text-yellow-600' 
    },
    { 
      title: 'Avg. Progress', 
      value: `${stats.averageProgress}%`, 
      subtitle: 'Overall completion',
      icon: BarChart3, 
      color: 'text-cyan-600' 
    }
  ]

  return <StandardizedStats stats={statCards} columns={6} />
}
