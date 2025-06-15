'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wrench, Eye, Edit, Calendar, Clock, User, MapPin, CheckCircle, AlertTriangle, X, Search, Filter, Plus, Users, Settings } from 'lucide-react'
import { Employee, Project } from '@/lib/enhanced-types'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { useInstallationFormManager } from '@/components/ui/unified-form-manager'
import { SectionHeader, SearchFilterBar } from '@/components/ui/section-header'
import { StatusBadge, ActionButtons, DataCell, ContactInfo, formatCurrency, formatDate } from '@/components/ui/data-table-components'
import { statusConfigs, priorityConfigs } from '@/lib/design-system'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"

interface Installation {
  id: string
  installation_date: string
  installation_time?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  equipment_details?: string
  installation_notes?: string
  completion_notes?: string
  project?: { 
    project_name: string
    project_number: string
    customer?: { name: string; phone: string; email: string }
    address?: string
  }
  lead_technician?: { full_name: string; phone?: string }
  assistant_technician?: { full_name: string; phone?: string }
  supervisor?: { full_name: string; phone?: string }
  created_at: string
}

interface UnifiedInstallationsListProps {
  installations: Installation[]
  employee: Employee
  projects: Project[]
  employees: Employee[]
}

export default function UnifiedInstallationsList({ installations, employee, projects, employees }: UnifiedInstallationsListProps) {
  const [filteredInstallations, setFilteredInstallations] = useState(installations)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [currentInstallations, setCurrentInstallations] = useState(installations)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Initialize form manager with unified system
  const createFormModal = useInstallationFormManager(projects, employees, refreshData)

  // Refresh installations data
  async function refreshData() {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('installations')
        .select(`
          *,
          project:projects(
            project_name, 
            project_number,
            address,
            customer:customers(name, phone, email)
          ),
          lead_technician:employees!installations_lead_technician_id_fkey(full_name, phone),
          assistant_technician:employees!installations_assistant_technician_id_fkey(full_name, phone),
          supervisor:employees!installations_supervisor_id_fkey(full_name, phone)
        `)
        .order('installation_date', { ascending: true })

      if (error) throw error

      setCurrentInstallations(data || [])
      setFilteredInstallations(data || [])
      notify.success('Installations refreshed successfully')
    } catch (error) {
      console.error('Error refreshing installations:', error)
      notify.error('Failed to refresh installations')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter installations based on search and filters
  const handleFilter = () => {
    let filtered = currentInstallations

    if (searchTerm) {
      filtered = filtered.filter(installation =>
        installation.project?.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.project?.project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.project?.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.project?.customer?.phone.includes(searchTerm) ||
        installation.lead_technician?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.assistant_technician?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.supervisor?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.equipment_details?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(installation => installation.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(installation => installation.priority === priorityFilter)
    }

    setFilteredInstallations(filtered)
  }

  // Apply filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, priorityFilter, currentInstallations])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'TBD'
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  const getInstallationPriority = (installation: Installation) => {
    const installDate = new Date(installation.installation_date)
    const now = new Date()
    const diffDays = Math.ceil((installDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (installation.status === 'in_progress') return 5
    if (installation.status === 'scheduled' && diffDays <= 1) return 4
    if (installation.priority === 'urgent') return 3
    if (installation.priority === 'high') return 2
    if (installation.status === 'on_hold') return 1
    return 0
  }

  // Sort installations by priority and date
  const sortedInstallations = [...filteredInstallations].sort((a, b) => {
    const priorityDiff = getInstallationPriority(b) - getInstallationPriority(a)
    if (priorityDiff !== 0) return priorityDiff
    
    return new Date(a.installation_date).getTime() - new Date(b.installation_date).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Installations</h2>
          <p className="text-sm text-gray-600">Schedule and track equipment installations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by project, customer, technician, equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-white/30"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 bg-white/50 border-white/30">
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
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32 bg-white/50 border-white/30">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="bg-white/50 border-white/30 hover:bg-white/70"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>
            Showing {filteredInstallations.length} of {currentInstallations.length} installations
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
            {priorityFilter !== 'all' && ` with priority "${priorityFilter}"`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-1 text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Installations Grid */}
      {sortedInstallations.length === 0 ? (
        <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 'No matching installations found' : 'No installations yet'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search terms or filters' 
                : 'Schedule your first installation to get started'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && priorityFilter === 'all') && (
              <Button
                onClick={createFormModal.openCreateModal}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Schedule First Installation
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedInstallations.map((installation) => {
            const isUpcoming = installation.status === 'scheduled' && new Date(installation.installation_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
            const isHighPriority = installation.priority === 'urgent' || installation.priority === 'high'
            
            return (
              <Card key={installation.id} className={`group hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/70 border-white/20 shadow-lg hover:bg-white/80 ${isUpcoming ? 'ring-2 ring-orange-200' : ''} ${isHighPriority ? 'border-l-4 border-l-red-400' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                        {installation.project?.project_name || 'Unknown Project'}
                      </CardTitle>
                      <p className="text-sm text-gray-600 truncate">
                        {installation.project?.project_number || 'No Project Number'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {installation.project?.customer?.name || 'N/A'}
                      </p>
                      {installation.project?.address && (
                        <p className="text-sm text-gray-600 truncate flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {installation.project.address}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <StatusBadge 
                        status={installation.status} 
                        statusConfig={statusConfigs.installations}
                        className="text-xs"
                      />
                      <StatusBadge 
                        status={installation.priority} 
                        statusConfig={priorityConfigs}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(installation.installation_date)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{formatTime(installation.installation_time)}</span>
                    </div>
                    {installation.lead_technician?.full_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Lead Tech:</span>
                        <span className="truncate ml-2">{installation.lead_technician.full_name}</span>
                      </div>
                    )}
                    {installation.assistant_technician?.full_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Assistant:</span>
                        <span className="truncate ml-2">{installation.assistant_technician.full_name}</span>
                      </div>
                    )}
                    {installation.equipment_details && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Equipment:</span>
                        <span className="truncate ml-2">{installation.equipment_details}</span>
                      </div>
                    )}
                  </div>

                  {isUpcoming && (
                    <div className="flex items-center gap-1 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      <Clock className="h-4 w-4" />
                      <span>Installation Tomorrow</span>
                    </div>
                  )}

                  {installation.status === 'in_progress' && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                      <Clock className="h-4 w-4" />
                      <span>Installation In Progress</span>
                    </div>
                  )}

                  {installation.status === 'on_hold' && (
                    <div className="flex items-center gap-1 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Installation On Hold</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white/50 border-white/30 hover:bg-white/70"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => createFormModal.openEditModal(installation)}
                      className="flex-1 bg-white/50 border-white/30 hover:bg-white/70"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {installation.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={createFormModal.openCreateModal}
        icon={<Plus className="h-6 w-6" />}
        label="Schedule New Installation"
        variant="monochrome"
      />

      {/* Form Modal */}
      <createFormModal.FormModal />
    </div>
  )
}
