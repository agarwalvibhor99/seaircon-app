'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building, Calendar, User, DollarSign, Eye, Edit, FileText, Search, Filter, X, Plus, AlertCircle, CheckCircle, Clock, Pause } from 'lucide-react'
import { Employee, Customer, Project } from '@/lib/enhanced-types'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { useProjectFormManager } from '@/components/ui/unified-form-manager'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"

interface UnifiedProjectsListProps {
  projects: Project[]
  employee: Employee
  customers: Customer[]
  employees: Employee[]
}

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FileText },
  planning: { color: 'bg-blue-100 text-blue-800', label: 'Planning', icon: Calendar },
  approved: { color: 'bg-cyan-100 text-cyan-800', label: 'Approved', icon: CheckCircle },
  in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress', icon: Clock },
  on_hold: { color: 'bg-orange-100 text-orange-800', label: 'On Hold', icon: Pause },
  completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: X }
}

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
}

export default function UnifiedProjectsList({ projects, employee, customers, employees }: UnifiedProjectsListProps) {
  const [filteredProjects, setFilteredProjects] = useState(projects)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [currentProjects, setCurrentProjects] = useState(projects)

  // Update projects when props change
  useEffect(() => {
    setCurrentProjects(projects)
    setFilteredProjects(projects)
  }, [projects])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Initialize form manager with unified system
  const createFormModal = useProjectFormManager(customers, employees, refreshData)

  // Refresh projects data
  async function refreshData() {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customers(name, phone, email),
          project_manager:employees!projects_project_manager_id_fkey(full_name),
          quotations(id, quotation_number, total_amount)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCurrentProjects(data || [])
      setFilteredProjects(data || [])
      notify.success('Projects refreshed successfully')
    } catch (error) {
      console.error('Error refreshing projects:', error)
      notify.error('Failed to refresh projects')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter projects based on search and filters
  const handleFilter = () => {
    let filtered = currentProjects

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_manager?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.site_address?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter)
    }

    setFilteredProjects(filtered)
  }

  // Apply filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, priorityFilter, currentProjects])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-600">Manage customer projects and installations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Building className="h-4 w-4" />
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
                  placeholder="Search by project name, number, customer, manager..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-white/30"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/50 border-white/30">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40 bg-white/50 border-white/30">
                  <SelectValue placeholder="Filter by priority" />
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
            Showing {filteredProjects.length} of {currentProjects.length} projects
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

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 'No matching projects found' : 'No projects yet'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search terms or filters' 
                : 'Create your first project to get started'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && priorityFilter === 'all') && (
              <Button
                onClick={createFormModal.openCreateModal}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                <Building className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const StatusIcon = statusConfig[project.status]?.icon || Building
            
            return (
              <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/70 border-white/20 shadow-lg hover:bg-white/80">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate">
                        {project.project_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 font-mono">{project.project_number}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {project.customer?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={`${statusConfig[project.status]?.color} flex items-center gap-1 text-xs`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[project.status]?.label}
                      </Badge>
                      <Badge className={`${priorityConfig[project.priority]?.color} text-xs`}>
                        {priorityConfig[project.priority]?.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {project.project_value && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-semibold text-green-700">{formatCurrency(project.project_value)}</span>
                      </div>
                    )}
                    {project.estimated_start_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Start Date:</span>
                        <span>{formatDate(project.estimated_start_date)}</span>
                      </div>
                    )}
                    {project.estimated_end_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">End Date:</span>
                        <span>{formatDate(project.estimated_end_date)}</span>
                      </div>
                    )}
                    {project.project_manager?.full_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Manager:</span>
                        <span className="truncate ml-2">{project.project_manager.full_name}</span>
                      </div>
                    )}
                    {project.site_address && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Location:</span>
                        <span className="truncate ml-2">{project.site_address}</span>
                      </div>
                    )}
                  </div>

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
                      onClick={() => createFormModal.openEditModal(project)}
                      className="flex-1 bg-white/50 border-white/30 hover:bg-white/70"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
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
        label="Create New Project"
        variant="monochrome"
      />

      {/* Form Modal */}
      <createFormModal.FormModal />
    </div>
  )
}
