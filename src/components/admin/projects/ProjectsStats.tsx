'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, Clock, CheckCircle, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react'

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <ClipboardList className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-xs text-gray-500">{stats.planning} planning</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-green-600">{stats.completionRate}% success rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Issues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.onHold}</p>
              <p className="text-xs text-gray-500">{stats.cancelled} cancelled</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-cyan-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
              <p className="text-xs text-gray-500">All projects</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.completedBudget)}</p>
              <p className="text-xs text-green-600">Revenue generated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
