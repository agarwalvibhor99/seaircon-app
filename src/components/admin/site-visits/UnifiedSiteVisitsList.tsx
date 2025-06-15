'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, MapPin, Eye, Edit, CheckCircle, AlertTriangle, X, Search, Filter, Plus, Users, CalendarCheck } from 'lucide-react'
import { Employee } from '@/lib/enhanced-types'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { useSiteVisitFormManager } from '@/components/ui/unified-form-manager'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"

interface Lead {
  id: string
  name: string
  phone: string
  email: string
  address?: string
}

interface SiteVisit {
  id: string
  visit_date: string
  visit_time: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
  address?: string
  lead?: { name: string; phone: string; email: string; address?: string }
  customer?: { name: string; phone: string; email: string; address?: string }
  technician?: { full_name: string; phone?: string }
  supervisor?: { full_name: string; phone?: string }
  created_at: string
}

interface UnifiedSiteVisitsListProps {
  visits: SiteVisit[]
  employee: Employee
  leads: Lead[]
  employees: Employee[]
}

const statusConfig = {
  scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled', icon: Calendar },
  in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress', icon: Clock },
  completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: X }
}

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
}

export default function UnifiedSiteVisitsList({ visits, employee, leads, employees }: UnifiedSiteVisitsListProps) {
  const [filteredVisits, setFilteredVisits] = useState(visits)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [currentVisits, setCurrentVisits] = useState(visits)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Initialize form manager with unified system
  const createFormModal = useSiteVisitFormManager(leads, employees, refreshData)

  // Refresh site visits data
  async function refreshData() {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('site_visits')
        .select(`
          *,
          lead:leads(name, phone, email, address),
          customer:customers(name, phone, email, address),
          technician:employees!site_visits_technician_id_fkey(full_name, phone),
          supervisor:employees!site_visits_supervisor_id_fkey(full_name, phone)
        `)
        .order('visit_date', { ascending: true })

      if (error) throw error

      setCurrentVisits(data || [])
      setFilteredVisits(data || [])
      notify.success('Site visits refreshed successfully')
    } catch (error) {
      console.error('Error refreshing site visits:', error)
      notify.error('Failed to refresh site visits')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter visits based on search and filters
  const handleFilter = () => {
    let filtered = currentVisits

    if (searchTerm) {
      filtered = filtered.filter(visit =>
        visit.lead?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.lead?.phone.includes(searchTerm) ||
        visit.customer?.phone.includes(searchTerm) ||
        visit.technician?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.supervisor?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.address?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(visit => visit.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(visit => visit.priority === priorityFilter)
    }

    setFilteredVisits(filtered)
  }

  // Apply filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, priorityFilter, currentVisits])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
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

  const getVisitPriority = (visit: SiteVisit) => {
    const visitDate = new Date(visit.visit_date)
    const now = new Date()
    const diffDays = Math.ceil((visitDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (visit.status === 'in_progress') return 4
    if (visit.status === 'scheduled' && diffDays <= 1) return 3
    if (visit.priority === 'urgent') return 2
    if (visit.priority === 'high') return 1
    return 0
  }

  // Sort visits by priority and date
  const sortedVisits = [...filteredVisits].sort((a, b) => {
    const priorityDiff = getVisitPriority(b) - getVisitPriority(a)
    if (priorityDiff !== 0) return priorityDiff
    
    return new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Visits</h2>
          <p className="text-sm text-gray-600">Schedule and manage customer site visits</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <CalendarCheck className="h-4 w-4" />
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
                  placeholder="Search by customer, technician, address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-white/30"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-white/50 border-white/30">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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
            Showing {filteredVisits.length} of {currentVisits.length} site visits
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

      {/* Site Visits Grid */}
      {sortedVisits.length === 0 ? (
        <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 'No matching site visits found' : 'No site visits yet'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search terms or filters' 
                : 'Schedule your first site visit to get started'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && priorityFilter === 'all') && (
              <Button
                onClick={createFormModal.openCreateModal}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule First Visit
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedVisits.map((visit) => {
            const StatusIcon = statusConfig[visit.status]?.icon || Calendar
            const isUpcoming = visit.status === 'scheduled' && new Date(visit.visit_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
            const isHighPriority = visit.priority === 'urgent' || visit.priority === 'high'
            
            return (
              <Card key={visit.id} className={`group hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/70 border-white/20 shadow-lg hover:bg-white/80 ${isUpcoming ? 'ring-2 ring-blue-200' : ''} ${isHighPriority ? 'border-l-4 border-l-orange-400' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {visit.lead?.name || visit.customer?.name || 'Unknown Customer'}
                      </CardTitle>
                      <p className="text-sm text-gray-600 truncate">
                        {visit.lead?.phone || visit.customer?.phone || 'N/A'}
                      </p>
                      {visit.address && (
                        <p className="text-sm text-gray-600 truncate flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {visit.address}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={`${statusConfig[visit.status]?.color} flex items-center gap-1 text-xs`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[visit.status]?.label}
                      </Badge>
                      <Badge className={`${priorityConfig[visit.priority]?.color} text-xs`}>
                        {priorityConfig[visit.priority]?.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(visit.visit_date)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{formatTime(visit.visit_time)}</span>
                    </div>
                    {visit.technician?.full_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Technician:</span>
                        <span className="truncate ml-2">{visit.technician.full_name}</span>
                      </div>
                    )}
                    {visit.supervisor?.full_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Supervisor:</span>
                        <span className="truncate ml-2">{visit.supervisor.full_name}</span>
                      </div>
                    )}
                  </div>

                  {isUpcoming && (
                    <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      <Clock className="h-4 w-4" />
                      <span>Visit Tomorrow</span>
                    </div>
                  )}

                  {visit.status === 'in_progress' && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                      <Clock className="h-4 w-4" />
                      <span>Visit In Progress</span>
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
                      onClick={() => createFormModal.openEditModal(visit)}
                      className="flex-1 bg-white/50 border-white/30 hover:bg-white/70"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {visit.status === 'scheduled' && (
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
        label="Schedule New Visit"
        variant="monochrome"
      />

      {/* Form Modal */}
      <createFormModal.FormModal />
    </div>
  )
}
