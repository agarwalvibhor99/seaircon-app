'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search,
  MessageSquare,
  Eye,
  Edit
} from 'lucide-react'
import { CRMService, ConsultationRequest, DashboardStats } from '@/lib/crm-service'
import { useRouter } from 'next/navigation'

// Simple date formatting function to replace date-fns temporarily
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [requests, setRequests] = useState<ConsultationRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ConsultationRequest[]>([])
  const [followUps, setFollowUps] = useState<ConsultationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter, priorityFilter])

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          localStorage.removeItem('auth_token')
          router.push('/login')
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('Auth verification failed:', error)
        localStorage.removeItem('auth_token')
        router.push('/login')
      } finally {
        setAuthLoading(false)
      }
    }

    verifyAuth()
  }, [router])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [statsResult, requestsResult, followUpsResult] = await Promise.all([
        CRMService.getDashboardStats(),
        CRMService.getConsultationRequests({ limit: 100 }),
        CRMService.getUpcomingFollowUps()
      ])

      if (statsResult.data) setStats(statsResult.data)
      if (requestsResult.data) setRequests(requestsResult.data)
      if (followUpsResult.data) setFollowUps(followUpsResult.data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = useCallback(() => {
    let filtered = requests

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.phone.includes(searchTerm)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter)
    }

    setFilteredRequests(filtered)
  }, [requests, searchTerm, statusFilter, priorityFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'qualified': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'quote_sent': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'follow_up': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'won': return 'bg-green-100 text-green-800 border-green-200'
      case 'lost': return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatServiceType = (serviceType: string) => {
    return serviceType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
  }

  // Show loading spinner while verifying auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Verifying authentication...</span>
        </div>
      </div>
    )
  }

  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage consultation requests and customer relationships</p>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-blue-600 capitalize">{user.role}</p>
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderHeader()}
        
        {/* Security Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm text-blue-800">
              <strong>Secure Session:</strong> Your admin session is protected with JWT authentication and rate limiting.
            </span>
          </div>
        </div>

        {/* ...existing dashboard content... */}
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
                <p className="text-xs text-muted-foreground">
                  All consultation requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Requests</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.statusStats.new || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting first contact
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.urgencyStats.emergency || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Urgent attention required
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {followUps.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Due this week
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">All Requests</TabsTrigger>
            <TabsTrigger value="followups">Follow-ups</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters & Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, company, or phone..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="quote_sent">Quote Sent</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{request.full_name}</CardTitle>
                        <CardDescription>
                          {request.company && `${request.company} • `}
                          {formatServiceType(request.service_type)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <a href={`mailto:${request.email}`} className="text-cyan-600 hover:underline">
                            {request.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <a href={`tel:${request.phone}`} className="text-cyan-600 hover:underline">
                            {request.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {formatDate(request.created_at)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {request.property_type && (
                          <div className="text-sm">
                            <span className="font-medium">Property:</span> {request.property_type}
                          </div>
                        )}
                        {request.project_size && (
                          <div className="text-sm">
                            <span className="font-medium">Size:</span> {request.project_size}
                          </div>
                        )}
                        {request.budget_range && (
                          <div className="text-sm">
                            <span className="font-medium">Budget:</span> {request.budget_range}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {request.message && (
                          <div className="text-sm">
                            <span className="font-medium">Message:</span>
                            <p className="text-gray-600 mt-1 line-clamp-2">{request.message}</p>
                          </div>
                        )}
                        {request.next_follow_up && (
                          <div className="text-sm">
                            <span className="font-medium">Next Follow-up:</span>
                            <p className="text-orange-600 mt-1">
                              {formatDate(request.next_follow_up)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Source: {request.source}
                        </Badge>
                        {request.assigned_to && (
                          <Badge variant="outline" className="text-xs">
                            Assigned: {request.assigned_to}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredRequests.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                      <p className="text-gray-600">
                        {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                          ? 'Try adjusting your filters or search terms.'
                          : 'No consultation requests have been submitted yet.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="followups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Follow-ups</CardTitle>
                <CardDescription>
                  Consultation requests requiring follow-up within the next week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {followUps.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No follow-ups scheduled for the next week.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {followUps.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{request.full_name}</h4>
                          <p className="text-sm text-gray-600">{request.email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Due: {request.next_follow_up && formatDate(request.next_follow_up)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Follow Up
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Requests by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="space-y-2">
                      {Object.entries(stats.statusStats).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="capitalize">{status.replace('_', ' ')}</span>
                          <Badge className={getStatusColor(status)}>{count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requests by Urgency</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="space-y-2">
                      {Object.entries(stats.urgencyStats).map(([urgency, count]) => (
                        <div key={urgency} className="flex items-center justify-between">
                          <span className="capitalize">{urgency}</span>
                          <Badge className={getUrgencyColor(urgency)}>{count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
