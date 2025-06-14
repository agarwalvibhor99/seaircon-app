'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Mail,
  Filter
} from 'lucide-react'
import { Project, Customer, Employee } from '@/lib/enhanced-types-new'
import Link from 'next/link'

interface ProjectsListEnhancedProps {
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
} as const

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
} as const

const projectTypeConfig = {
  installation: { color: 'bg-blue-100 text-blue-800', label: 'Installation', icon: Package },
  maintenance: { color: 'bg-green-100 text-green-800', label: 'Maintenance', icon: Activity },
  repair: { color: 'bg-orange-100 text-orange-800', label: 'Repair', icon: AlertCircle },
  amc: { color: 'bg-purple-100 text-purple-800', label: 'AMC', icon: CheckCircle },
  consultation: { color: 'bg-cyan-100 text-cyan-800', label: 'Consultation', icon: Users },
  other: { color: 'bg-gray-100 text-gray-800', label: 'Other', icon: MoreHorizontal }
} as const

export default function ProjectsListEnhanced({ projects, customers = [], employees = [] }: ProjectsListEnhancedProps) {
  const [filteredProjects, setFilteredProjects] = useState(projects)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(false)

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
    let filtered = enhancedProjects.length > 0 ? enhancedProjects : projects

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

  const getFinancialSummary = (project: Project) => {
    const quotations = project.quotations || []
    const invoices = project.invoices || []
    const payments = project.payments || []

    const totalQuoted = quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0)
    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0)
    const totalReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600">Manage your project portfolio</p>
        </div>
        <Link href="/admin/projects/create">
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2 text-cyan-600" />
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
            const statusInfo = statusConfig[project.status as keyof typeof statusConfig]
            const StatusIcon = statusInfo?.icon || FileText
            const typeInfo = projectTypeConfig[project.project_type as keyof typeof projectTypeConfig]
            const TypeIcon = typeInfo?.icon || Package
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
                      <Badge className={statusInfo?.color || 'bg-gray-100 text-gray-800'}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo?.label || project.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={priorityConfig[project.priority as keyof typeof priorityConfig]?.color || 'bg-gray-100 text-gray-800'}>
                      {priorityConfig[project.priority as keyof typeof priorityConfig]?.label || project.priority}
                    </Badge>
                    <Badge variant="outline" className={typeInfo?.color || 'bg-gray-100 text-gray-800'}>
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {typeInfo?.label || project.project_type}
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
                    <Link href={`/admin/projects/${project.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/projects/edit/${project.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
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
              <Link href="/admin/projects/create">
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
