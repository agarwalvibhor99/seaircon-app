'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCurrentUser, signOut } from '@/lib/auth-utils'
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
  Edit,
  Plus,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity
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
        const { user } = await getCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)
      } catch (error) {
        console.error('Auth verification failed:', error)
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
      await signOut(router)
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if logout fails
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
      </div>
      
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent">
                    SE AIRCON CRM
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Professional Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Request
                </Button>
              </div>
              
              {/* User Profile */}
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        {/* Welcome Section */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 right-8 -mb-4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-8 -mt-3 w-8 h-8 bg-white/10 rounded-full animate-pulse delay-500"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h2 className="text-3xl font-bold mb-2 leading-tight">
                    Welcome back, {user?.name}! 👋
                  </h2>
                  <p className="text-blue-100 text-base mb-4 opacity-90">
                    Here's what's happening with your CRM today
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-100" />
                        <span className="text-xs font-medium">
                          {new Date().toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-200" />
                        <span className="text-xs font-medium">
                          {followUps.length} follow-ups
                        </span>
                      </div>
                    </div>
                    {stats && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-200" />
                          <span className="text-xs font-medium">
                            {stats.totalRequests} requests
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40 backdrop-blur-sm transition-all duration-200"
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Reports
                  </Button>
                  <Button 
                    className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                  Total Requests
                </CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.totalRequests}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  All consultation requests
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                  New Requests
                </CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-cyan-600 mb-1">
                  {stats.statusStats.new || 0}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <Activity className="h-3 w-3 mr-1 text-cyan-500" />
                  Awaiting first contact
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                  Emergency
                </CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {stats.urgencyStats.emergency || 0}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-red-500" />
                  Urgent attention required
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                  Follow-ups
                </CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {followUps.length}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1 text-orange-500" />
                  Due this week
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg border-0 p-1 rounded-xl">
            <TabsTrigger 
              value="requests" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-2 rounded-lg font-medium transition-all duration-200"
            >
              All Requests
            </TabsTrigger>
            <TabsTrigger 
              value="followups"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Follow-ups
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {/* Enhanced Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center">
                  <Search className="h-4 w-4 mr-2 text-blue-600" />
                  Filters & Search
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  Find and filter consultation requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, company, or phone..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 border-gray-200/60 focus:border-blue-500/60 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
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
                      <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200">
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Requests List */}
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.01]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                          {request.full_name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-sm">
                          {request.company && (
                            <>
                              <span className="font-medium text-gray-700">{request.company}</span>
                              <span className="mx-2 text-gray-400">•</span>
                            </>
                          )}
                          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-medium">
                            {formatServiceType(request.service_type)}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${getStatusColor(request.status)} shadow-sm border px-3 py-1`}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(request.priority)} shadow-sm border px-3 py-1`}>
                          {request.priority}
                        </Badge>
                        <Badge className={`${getUrgencyColor(request.urgency)} shadow-sm border px-3 py-1`}>
                          {request.urgency}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Contact</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                            <Mail className="w-3 h-3 text-blue-600" />
                          </div>
                          <a href={`mailto:${request.email}`} className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors truncate">
                            {request.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                            <Phone className="w-3 h-3 text-green-600" />
                          </div>
                          <a href={`tel:${request.phone}`} className="text-green-600 hover:text-green-700 hover:underline font-medium transition-colors">
                            {request.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                            <Calendar className="w-3 h-3 text-gray-500" />
                          </div>
                          <span className="font-medium text-xs">{formatDate(request.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Project Details</h4>
                        {request.property_type && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">Property:</span> 
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                              {request.property_type}
                            </span>
                          </div>
                        )}
                        {request.project_size && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">Size:</span> 
                            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">
                              {request.project_size}
                            </span>
                          </div>
                        )}
                        {request.budget_range && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">Budget:</span> 
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
                              {request.budget_range}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Additional Info</h4>
                        {request.message && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Message:</span>
                            <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                              <p className="text-gray-600 line-clamp-3">{request.message}</p>
                            </div>
                          </div>
                        )}
                        {request.next_follow_up && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Next Follow-up:</span>
                            <div className="mt-1 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span className="text-orange-600 font-medium">
                                {formatDate(request.next_follow_up)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/60">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                          Source: {request.source}
                        </Badge>
                        {request.assigned_to && (
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                            Assigned: {request.assigned_to}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredRequests.length === 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">No requests found</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                          ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                          : 'No consultation requests have been submitted yet. When customers submit requests, they\'ll appear here.'}
                      </p>
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? (
                        <Button 
                          onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            setPriorityFilter('all')
                          }}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                          Clear Filters
                        </Button>
                      ) : (
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Request
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="followups" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Upcoming Follow-ups
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Consultation requests requiring follow-up within the next week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {followUps.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">All caught up! 🎉</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      No follow-ups scheduled for the next week. Great job staying on top of your customer communications!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {followUps.map((request) => (
                      <div key={request.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200/60 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{request.full_name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <a href={`mailto:${request.email}`} className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                                  {request.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-green-500" />
                                <a href={`tel:${request.phone}`} className="text-green-600 hover:text-green-700 hover:underline font-medium">
                                  {request.phone}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <span className="font-medium text-orange-700">
                                Due: {request.next_follow_up && formatDate(request.next_follow_up)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-6">
                            <Badge className={`${getStatusColor(request.status)} shadow-sm border px-3 py-1`}>
                              {request.status.replace('_', ' ')}
                            </Badge>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Follow Up
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Requests by Status
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Current distribution of request statuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="space-y-4">
                      {Object.entries(stats.statusStats).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100/80 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')}`}></div>
                            <span className="font-medium text-gray-700 capitalize">
                              {status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">{count}</span>
                            <Badge className={`${getStatusColor(status)} shadow-sm`}>
                              {Math.round((count / stats.totalRequests) * 100)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                    Requests by Urgency
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Priority levels of incoming requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="space-y-4">
                      {Object.entries(stats.urgencyStats).map(([urgency, count]) => (
                        <div key={urgency} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100/80 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getUrgencyColor(urgency).split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')}`}></div>
                            <span className="font-medium text-gray-700 capitalize">
                              {urgency}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">{count}</span>
                            <Badge className={`${getUrgencyColor(urgency)} shadow-sm`}>
                              {Math.round((count / stats.totalRequests) * 100)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Additional Analytics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-blue-800 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {stats.totalRequests > 0 ? Math.round(((stats.statusStats.won || 0) / stats.totalRequests) * 100) : 0}%
                      </div>
                      <p className="text-sm text-blue-700">
                        Won out of total requests
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-green-800 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {stats.totalRequests > 0 ? Math.round((((stats.statusStats.won || 0) + (stats.statusStats.quote_sent || 0)) / stats.totalRequests) * 100) : 0}%
                      </div>
                      <p className="text-sm text-green-700">
                        Won + Quote sent
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-purple-800 flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Active Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {(stats.statusStats.new || 0) + (stats.statusStats.contacted || 0) + (stats.statusStats.qualified || 0) + (stats.statusStats.follow_up || 0)}
                      </div>
                      <p className="text-sm text-purple-700">
                        In progress requests
                      </p>
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
