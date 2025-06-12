'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClipboardList, Eye, Edit, Play, Pause, CheckCircle, Calendar, DollarSign } from 'lucide-react'

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

interface ProjectsListProps {
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

export default function ProjectsList({ projects }: ProjectsListProps) {
  const [filteredProjects, setFilteredProjects] = useState(projects)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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
                <SelectContent>
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
                <SelectContent>
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
