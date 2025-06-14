'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClipboardList, Eye, Edit, Play, Pause, CheckCircle, Trash2, Calendar, DollarSign, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"

interface Project {
  id: string
  project_name: string
  project_number: string
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  budget: number
  start_date?: string
  end_date?: string
  estimated_completion?: string
  created_at: string
  customers?: { name: string; phone: string; email: string }
  project_manager?: { full_name: string }
  quotations?: { quotation_number: string; total_amount: number }[]
  description?: string
}

interface ProjectsListSimpleProps {
  projects: Project[]
}

const statusConfig = {
  planning: { color: 'bg-blue-100 text-blue-800', label: 'Planning', icon: ClipboardList },
  in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress', icon: Play },
  on_hold: { color: 'bg-orange-100 text-orange-800', label: 'On Hold', icon: Pause },
  completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: Pause }
}

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
}

export default function ProjectsListSimple({ projects: initialProjects }: ProjectsListSimpleProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [filteredProjects, setFilteredProjects] = useState(initialProjects)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Filter projects based on search and filters
  const handleFilter = () => {
    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Update filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, priorityFilter, projects])

  const handleEdit = (projectId: string) => {
    router.push(`/admin/projects/edit/${projectId}`)
  }

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    setIsDeleting(projectId)
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Error deleting project:', error)
        notify.error('Failed to delete project')
        return
      }

      // Update local state
      const updatedProjects = projects.filter(project => project.id !== projectId)
      setProjects(updatedProjects)
      setFilteredProjects(filteredProjects.filter(project => project.id !== projectId))
      
      notify.success('Project deleted successfully')
    } catch (error) {
      console.error('Error deleting project:', error)
      notify.error('Failed to delete project')
    } finally {
      setIsDeleting(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button onClick={() => router.push('/admin/projects/new')}>
          Add New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-600 flex items-center">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      </div>

      {/* Projects List */}
      <div className="grid gap-6">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">No projects match your current filters.</p>
              <Button onClick={() => router.push('/admin/projects/new')}>
                Create First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => {
            const StatusIcon = statusConfig[project.status]?.icon || ClipboardList
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {project.project_name}
                      </h3>
                      <p className="text-sm text-gray-600">{project.project_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusConfig[project.status]?.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[project.status]?.label}
                      </Badge>
                      <Badge className={priorityConfig[project.priority]?.color}>
                        {priorityConfig[project.priority]?.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium ml-1">{formatCurrency(project.budget)}</span>
                    </div>
                    
                    {project.start_date && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Start:</span>
                        <span className="font-medium ml-1">{formatDate(project.start_date)}</span>
                      </div>
                    )}

                    {project.estimated_completion && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Est. Completion:</span>
                        <span className="font-medium ml-1">{formatDate(project.estimated_completion)}</span>
                      </div>
                    )}

                    {project.customers && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium ml-1">{project.customers.name}</span>
                      </div>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Created {formatDate(project.created_at)}
                      {project.project_manager && (
                        <span> • PM: {project.project_manager.full_name}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(project.id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(project.id)}
                        disabled={isDeleting === project.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {isDeleting === project.id ? 'Deleting...' : 'Delete'}
                      </Button>
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
