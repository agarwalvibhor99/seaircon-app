'use client'

import { Card, CardContent } from '@/components/ui/card'
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Installations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              <p className="text-xs text-gray-500">Upcoming</p>
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
              <p className="text-xs text-orange-600">Active work</p>
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
              <p className="text-xs text-green-600">{stats.completionRate}% success</p>
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
            <BarChart3 className="h-8 w-8 text-cyan-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageProgress}%</p>
              <p className="text-xs text-cyan-600">Overall completion</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
