'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, 
  Search, 
  Plus, 
  Eye, 
  Edit,
  Calendar,
  Users,
  DollarSign,
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  X,
  FileText,
  Receipt,
  CreditCard,
  Activity,
  TrendingUp,
  Package,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { Project, Customer, Employee, Quotation, Invoice, Payment, ProjectActivity } from '@/lib/enhanced-types-new'
import CreateProjectFormDialog from './CreateProjectFormDialog'
import EditProjectForm from './EditProjectForm'
import ProjectSummaryDashboard from './ProjectSummaryDashboard'
import ProjectActivityTimeline from './ProjectActivityTimeline'

interface ProjectsListProps {
  projects: Project[]
  customers?: Customer[]
  employees?: Employee[]
}

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FileText },
  planning: { color: 'bg-blue-100 text-blue-800', label: 'Planning', icon: Calendar },
  approved: { color: 'bg-cyan-100 text-cyan-800', label: 'Approved', icon: CheckCircle },
  in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress', icon: Activity },
  on_hold: { color: 'bg-orange-100 text-orange-800', label: 'On Hold', icon: Clock },
  completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: X }
}

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
}

const projectTypeConfig = {
  installation: { color: 'bg-blue-100 text-blue-800', label: 'Installation', icon: Package },
  maintenance: { color: 'bg-green-100 text-green-800', label: 'Maintenance', icon: Activity },
  repair: { color: 'bg-orange-100 text-orange-800', label: 'Repair', icon: AlertCircle },
  amc: { color: 'bg-purple-100 text-purple-800', label: 'AMC', icon: CheckCircle },
  consultation: { color: 'bg-cyan-100 text-cyan-800', label: 'Consultation', icon: Users },
  other: { color: 'bg-gray-100 text-gray-800', label: 'Other', icon: MoreHorizontal }
}

export default function ProjectsList({ projects, customers = [], employees = [] }: ProjectsListProps) {
  const [filteredProjects, setFilteredProjects] = useState(projects)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Enhanced project data (with related entities)
  const [enhancedProjects, setEnhancedProjects] = useState<Project[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    setFilteredProjects(projects)
    loadEnhancedProjectData()
  }, [projects])

  useEffect(() => {
    filterProjects()
  }, [enhancedProjects, searchTerm, statusFilter, priorityFilter, typeFilter])

  const loadEnhancedProjectData = async () => {
    try {
      setLoading(true)
      const projectIds = projects.map(p => p.id)
      
      if (projectIds.length === 0) {
        setEnhancedProjects([])
        return
      }

      // Load related data for all projects
      const [quotationsResult, invoicesResult, paymentsResult, activitiesResult] = await Promise.all([
        supabase
          .from('quotations')
          .select('*')
          .in('project_id', projectIds),
        supabase
          .from('invoices')
          .select('*')
          .in('project_id', projectIds),
        supabase
          .from('payments')
          .select('*')
          .in('project_id', projectIds),
        supabase
          .from('project_activities')
          .select('*, performed_by_employee:employees!project_activities_performed_by_fkey(full_name)')
          .in('project_id', projectIds)
          .order('performed_at', { ascending: false })
      ])

      // Enhance projects with related data
      const enhanced = projects.map(project => ({
        ...project,
        quotations: quotationsResult.data?.filter(q => q.project_id === project.id) || [],
        invoices: invoicesResult.data?.filter(i => i.project_id === project.id) || [],
        payments: paymentsResult.data?.filter(p => p.project_id === project.id) || [],
        activities: activitiesResult.data?.filter(a => a.project_id === project.id) || []
      }))

      setEnhancedProjects(enhanced)
    } catch (error) {
      console.error('Error loading enhanced project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = enhancedProjects

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_manager?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.address?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(project => project.project_type === typeFilter)
    }

    setFilteredProjects(filtered)
  }

  const handleCreateProject = () => {
    setShowCreateDialog(true)
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setShowEditDialog(true)
  }

  const handleViewProject = (project: Project) => {
    setSelectedProject(project)
    setShowViewDialog(true)
  }

  const handleProjectCreated = () => {
    setShowCreateDialog(false)
    // Refresh data
    window.location.reload()
  }

  const handleProjectUpdated = () => {
    setShowEditDialog(false)
    setSelectedProject(null)
    // Refresh data
    window.location.reload()
  }

  const getFinancialSummary = (project: Project) => {
    const quotations = project.quotations || []
    const invoices = project.invoices || []
    const payments = project.payments || []

    const totalQuoted = quotations.reduce((sum, q) => sum + q.total_amount, 0)
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.total_amount, 0)
    const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0)
    const outstanding = totalInvoiced - totalReceived

    return { totalQuoted, totalInvoiced, totalReceived, outstanding }
  }

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
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600">Manage your project portfolio</p>
        </div>
        <Button onClick={handleCreateProject} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center">
            <Search className="h-5 w-5 mr-2 text-cyan-600" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="amc">AMC</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setPriorityFilter('all')
                  setTypeFilter('all')
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const StatusIcon = statusConfig[project.status]?.icon || FileText
            const TypeIcon = projectTypeConfig[project.project_type]?.icon || Package
            const financial = getFinancialSummary(project)
            
            return (
              <Card key={project.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/95 backdrop-blur-sm group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors truncate">
                        {project.project_name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {project.project_number}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge className={statusConfig[project.status]?.color || 'bg-gray-100 text-gray-800'}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[project.status]?.label || project.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={priorityConfig[project.priority]?.color || 'bg-gray-100 text-gray-800'}>
                      {priorityConfig[project.priority]?.label || project.priority}
                    </Badge>
                    <Badge variant="outline" className={projectTypeConfig[project.project_type]?.color || 'bg-gray-100 text-gray-800'}>
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {projectTypeConfig[project.project_type]?.label || project.project_type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Customer & Manager */}
                  <div className="space-y-2">
                    {project.customer && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-700">{project.customer.name}</span>
                      </div>
                    )}
                    {project.project_manager && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">PM: {project.project_manager.full_name}</span>
                      </div>
                    )}
                    {project.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 truncate">{project.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Quoted</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(financial.totalQuoted)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Received</div>
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(financial.totalReceived)}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {project.quotations?.length || 0} quotes
                      </span>
                      <span className="flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        {project.invoices?.length || 0} invoices
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {project.payments?.length || 0} payments
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProject(project)}
                      className="flex-1 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                      className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
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

      {filteredProjects.length === 0 && !loading && (
        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search criteria.'
                : 'Get started by creating your first project.'}
            </p>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && typeFilter === 'all' && (
              <Button onClick={handleCreateProject} className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Project Dialog */}
      {showCreateDialog && (
        <CreateProjectFormDialog
          onSuccess={() => {
            setShowCreateDialog(false)
            handleProjectCreated()
          }}
          onCancel={() => setShowCreateDialog(false)}
        />
      )}

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Edit Project</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditDialog(false)}
              className="hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          {selectedProject && (
            <EditProjectForm
              project={selectedProject}
              customers={customers}
              employees={employees}
              onSuccess={handleProjectUpdated}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Project Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              {selectedProject?.project_name} - {selectedProject?.project_number}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowViewDialog(false)}
              className="hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          {selectedProject && (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Summary & Financials</TabsTrigger>
                <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <ProjectSummaryDashboard project={selectedProject} />
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-4">
                <ProjectActivityTimeline project={selectedProject} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
  const [priorityFilter, setPriorityFilter] = useState('all')

  // Filter projects based on search and filters
  const handleFilter = () => {
    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.customers?.phone.includes(searchTerm) ||
        project.project_manager?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, statusFilter, priorityFilter, projects])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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


  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by project name, number, customer, or manager..."
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
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="grid gap-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500">
                {projects.length === 0 
                  ? "No projects have been created yet."
                  : "No projects match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => {
            const StatusIcon = statusConfig[project.status].icon
            const overdue = project.estimated_completion && isOverdue(project.estimated_completion)
            
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {project.project_name}
                        </h3>
                        <Badge className={statusConfig[project.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[project.status].label}
                        </Badge>
                        <Badge className={priorityConfig[project.priority].color}>
                          {priorityConfig[project.priority].label}
                        </Badge>
                        {overdue && project.status !== 'completed' && (
                          <Badge className="bg-red-100 text-red-800">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Project #:</span>
                          <br />
                          {project.project_number}
                        </div>
                        
                        <div>
                          <span className="font-medium">Customer:</span>
                          <br />
                          {project.customers?.name || 'N/A'}
                        </div>
                        
                        <div>
                          <span className="font-medium">Budget:</span>
                          <br />
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(project.budget)}
                          </span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Manager:</span>
                          <br />
                          {project.project_manager?.full_name || 'Unassigned'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        {project.start_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Started: {formatDate(project.start_date)}</span>
                          </div>
                        )}
                        
                        {project.estimated_completion && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className={overdue ? 'text-red-600' : ''}>
                              Due: {formatDate(project.estimated_completion)}
                            </span>
                          </div>
                        )}
                        
                        {project.end_date && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Completed: {formatDate(project.end_date)}</span>
                          </div>
                        )}
                      </div>

                      {project.quotations && project.quotations.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            Quotation: {project.quotations[0].quotation_number} 
                            ({formatCurrency(project.quotations[0].total_amount)})
                          </span>
                        </div>
                      )}

                      {project.description && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{project.description}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {project.status !== 'completed' && project.status !== 'cancelled' && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      
                      {project.status === 'planning' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {project.status === 'in_progress' && (
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
    </div>
  )
}

export default ProjectsList
