'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, MapPin, Eye, Edit, CheckCircle } from 'lucide-react'

interface SiteVisit {
  id: string
  visit_date: string
  visit_time: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  notes?: string
  consultation_requests?: { name: string; phone: string }
  customers?: { name: string; phone: string }
  technician?: { full_name: string }
  supervisor?: { full_name: string }
}

interface SiteVisitsListProps {
  visits: SiteVisit[]
}

const statusConfig = {
  scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
  in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
  completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
}

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  medium: { color: 'bg-orange-100 text-orange-800', label: 'Medium' },
  high: { color: 'bg-red-100 text-red-800', label: 'High' }
}

export default function SiteVisitsList({ visits }: SiteVisitsListProps) {
  const [filteredVisits, setFilteredVisits] = useState(visits)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  // Filter visits based on search and filters
  const handleFilter = () => {
    let filtered = visits

    if (searchTerm) {
      filtered = filtered.filter(visit =>
        visit.consultation_requests?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.consultation_requests?.phone.includes(searchTerm) ||
        visit.customers?.phone.includes(searchTerm) ||
        visit.technician?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, statusFilter, priorityFilter, visits])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by customer name, phone, or technician..."
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visits List */}
      <div className="grid gap-4">
        {filteredVisits.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No site visits found</h3>
              <p className="text-gray-500">
                {visits.length === 0 
                  ? "No site visits have been scheduled yet."
                  : "No visits match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVisits.map((visit) => (
            <Card key={visit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {visit.consultation_requests?.name || visit.customers?.name}
                      </h3>
                      <Badge className={statusConfig[visit.status].color}>
                        {statusConfig[visit.status].label}
                      </Badge>
                      <Badge className={priorityConfig[visit.priority].color}>
                        {priorityConfig[visit.priority].label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(visit.visit_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(visit.visit_time)}</span>
                      </div>
                      
                      {visit.technician && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{visit.technician.full_name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{visit.consultation_requests?.phone || visit.customers?.phone}</span>
                      </div>
                    </div>
                    
                    {visit.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{visit.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {visit.status === 'scheduled' && (
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    
                    {visit.status === 'in_progress' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
