'use client'

import StandardizedStats from '@/components/ui/standardized-stats'
import { ClipboardList, Clock, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react'
import { IndianRupee } from '@/components/ui/icons/indian-rupee'

interface Project {
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  project_value: number
}

interface ProjectsStatsProps {
  projects: Project[]
}

export default function ProjectsStats({ projects }: ProjectsStatsProps) {
  const stats = {
    total: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    onHold: projects.filter(p => p.status === 'on_hold').length,
    completed: projects.filter(p => p.status === 'completed').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.project_value || 0), 0),
    completedBudget: projects
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.project_value || 0), 0),
    completionRate: projects.length > 0 
      ? ((projects.filter(p => p.status === 'completed').length / projects.length) * 100).toFixed(1)
      : '0'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statCards = [
    { 
      title: 'Total Projects', 
      value: stats.total, 
      icon: ClipboardList, 
      color: 'text-blue-600' 
    },
    { 
      title: 'In Progress', 
      value: stats.inProgress, 
      subtitle: `${stats.planning} planning`,
      icon: Clock, 
      color: 'text-orange-600' 
    },
    { 
      title: 'Completed', 
      value: stats.completed, 
      subtitle: `${stats.completionRate}% success rate`,
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
      title: 'Total Budget', 
      value: formatCurrency(stats.totalBudget), 
      subtitle: 'All projects',
      icon: IndianRupee, 
      color: 'text-cyan-600' 
    },
    { 
      title: 'Completed Value', 
      value: formatCurrency(stats.completedBudget), 
      subtitle: 'Revenue generated',
      icon: BarChart3, 
      color: 'text-green-600' 
    }
  ]

  return <StandardizedStats stats={statCards} columns={6} />
}
