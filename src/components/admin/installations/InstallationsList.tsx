'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wrench, Eye, Edit, Play, Pause, CheckCircle, Calendar, User, Clock, BarChart3, Plus } from 'lucide-react'
import CreateInstallationFormDialog from './CreateInstallationFormDialog'

interface Installation {
  id: string
  installation_date: string
  estimated_completion: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  progress_percentage: number
  current_phase: string
  notes?: string
  projects?: { project_name: string; project_number: string }
  customers?: { name: string; phone: string; email: string }
  technician_lead?: { full_name: string }
  supervisor?: { full_name: string }
}

interface InstallationsListProps {
  installations: Installation[]
  onRefresh?: () => void
}

const statusConfig = {
  scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled', icon: Calendar },
  in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress', icon: Play },
  completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
  on_hold: { color: 'bg-orange-100 text-orange-800', label: 'On Hold', icon: Pause },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: Pause }
}

export default function InstallationsList({ installations, onRefresh }: InstallationsListProps) {
  const [filteredInstallations, setFilteredInstallations] = useState(installations)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Filter installations based on search and filters
  const handleFilter = () => {
    let filtered = installations

    if (searchTerm) {
      filtered = filtered.filter(installation =>
        installation.projects?.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.projects?.project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.customers?.phone.includes(searchTerm) ||
        installation.technician_lead?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.current_phase.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(installation => installation.status === statusFilter)
    }

    setFilteredInstallations(filtered)
  }

  // Apply filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, installations])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (estimatedCompletion: string) => {
    const today = new Date()
    const completionDate = new Date(estimatedCompletion)
    return completionDate < today
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getPhaseIcon = (phase: string) => {
    const phaseIcons: { [key: string]: any } = {
      'site_preparation': Wrench,
      'equipment_installation': Play,
      'electrical_connection': BarChart3,
      'testing_commissioning': CheckCircle,
      'customer_training': User
    }
    return phaseIcons[phase] || Wrench
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by project, customer, technician, or phase..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installations List */}
      <div className="grid gap-4">
        {filteredInstallations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No installations found</h3>
              <p className="text-gray-500">
                {installations.length === 0 
                  ? "No installations have been scheduled yet."
                  : "No installations match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInstallations.map((installation) => {
            const StatusIcon = statusConfig[installation.status].icon
            const overdue = isOverdue(installation.estimated_completion)
            const PhaseIcon = getPhaseIcon(installation.current_phase)
            
            return (
              <Card key={installation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {installation.projects?.project_name || 'No Project'}
                        </h3>
                        <Badge className={statusConfig[installation.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[installation.status].label}
                        </Badge>
                        {overdue && installation.status !== 'completed' && (
                          <Badge className="bg-red-100 text-red-800">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Project #:</span>
                          <br />
                          {installation.projects?.project_number || 'N/A'}
                        </div>
                        
                        <div>
                          <span className="font-medium">Customer:</span>
                          <br />
                          {installation.customers?.name || 'N/A'}
                        </div>
                        
                        <div>
                          <span className="font-medium">Start Date:</span>
                          <br />
                          {formatDate(installation.installation_date)}
                        </div>
                        
                        <div>
                          <span className="font-medium">Target Completion:</span>
                          <br />
                          <span className={overdue ? 'text-red-600' : ''}>
                            {formatDate(installation.estimated_completion)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Progress: {installation.progress_percentage}%
                          </span>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <PhaseIcon className="h-4 w-4" />
                            <span className="capitalize">
                              {installation.current_phase.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(installation.progress_percentage)}`}
                            style={{ width: `${installation.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        {installation.technician_lead && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Lead: {installation.technician_lead.full_name}</span>
                          </div>
                        )}
                        
                        {installation.supervisor && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Supervisor: {installation.supervisor.full_name}</span>
                          </div>
                        )}
                      </div>

                      {installation.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{installation.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {installation.status !== 'completed' && installation.status !== 'cancelled' && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                      )}
                      
                      {installation.status === 'scheduled' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {installation.status === 'in_progress' && installation.progress_percentage >= 95 && (
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create Installation Button */}
      <div className="fixed bottom-4 right-4">
        <Button 
          onClick={() => setShowCreateDialog(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Installation
        </Button>
      </div>

      {/* Create Installation Dialog */}
      {showCreateDialog && (
        <CreateInstallationFormDialog 
          onSuccess={() => {
            setShowCreateDialog(false)
            onRefresh?.()
          }}
          onCancel={() => setShowCreateDialog(false)}
        />
      )}
    </div>
  )
}
