'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { 
  Users, 
  ClipboardList, 
  DollarSign,
  Wrench,
  TrendingUp,
  BarChart3,
  Calendar
} from 'lucide-react'

interface Lead {
  status: string
  service_type: string
  created_at: string
  urgency: string
}

interface Project {
  status: string
  budget: number
  created_at: string
  start_date?: string
  end_date?: string
}

interface Quotation {
  status: string
  total_amount: number
  created_at: string
  valid_until: string
}

interface Invoice {
  status: string
  total_amount: number
  created_at: string
  due_date: string
  issue_date: string
}

interface Installation {
  status: string
  progress_percentage: number
  installation_date: string
  estimated_completion: string
}

interface ReportsOverviewProps {
  leads: Lead[]
  projects: Project[]
  quotations: Quotation[]
  invoices: Invoice[]
  installations: Installation[]
}

export default function ReportsOverview({ 
  leads, 
  projects, 
  quotations, 
  invoices, 
  installations 
}: ReportsOverviewProps) {
  const [timeRange, setTimeRange] = useState('30')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Filter data based on time range (commented out for now)
  // const filterByTimeRange = (data: any[], range: string, dateField: string) => {
  //   const days = parseInt(range)
  //   const cutoffDate = new Date()
  //   cutoffDate.setDate(cutoffDate.getDate() - days)
  //   
  //   return data.filter(item => new Date(item[dateField]) >= cutoffDate)
  // }

  // Lead conversion funnel
  const leadStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    quoteSent: leads.filter(l => l.status === 'quote_sent').length,
    won: leads.filter(l => l.status === 'won').length,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'won').length / leads.length) * 100).toFixed(1) : '0'
  }

  // Revenue metrics
  const revenueStats = {
    quotedAmount: quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0),
    invoicedAmount: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
    paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0),
    outstandingAmount: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + (i.total_amount || 0), 0),
    projectBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  }

  // Performance metrics
  const performanceStats = {
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    activeInstallations: installations.filter(i => i.status === 'in_progress').length,
    completedInstallations: installations.filter(i => i.status === 'completed').length,
    averageInstallationProgress: installations.length > 0 
      ? Math.round(installations.reduce((sum, i) => sum + (i.progress_percentage || 0), 0) / installations.length)
      : 0
  }

  // Service type breakdown
  const serviceTypes = leads.reduce((acc: { [key: string]: number }, lead) => {
    acc[lead.service_type] = (acc[lead.service_type] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{leadStats.total}</p>
                <p className="text-xs text-green-600">{leadStats.conversionRate}% conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{performanceStats.activeProjects}</p>
                <p className="text-xs text-gray-500">{performanceStats.completedProjects} completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue Collected</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(revenueStats.paidAmount)}</p>
                <p className="text-xs text-orange-600">{formatCurrency(revenueStats.outstandingAmount)} pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-cyan-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Installations</p>
                <p className="text-2xl font-bold text-gray-900">{performanceStats.activeInstallations}</p>
                <p className="text-xs text-cyan-600">{performanceStats.averageInstallationProgress}% avg progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Funnel</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>New Leads</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-sm font-medium">{leadStats.new}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Contacted</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${(leadStats.contacted / leadStats.total) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{leadStats.contacted}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Qualified</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(leadStats.qualified / leadStats.total) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{leadStats.qualified}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Quote Sent</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${(leadStats.quoteSent / leadStats.total) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{leadStats.quoteSent}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Won</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(leadStats.won / leadStats.total) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{leadStats.won}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(serviceTypes).map(([service, count]) => (
                    <div key={service} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{service.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-cyan-600 h-2 rounded-full" 
                            style={{ width: `${(count / leadStats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Quoted</span>
                  <span className="font-bold">{formatCurrency(revenueStats.quotedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Invoiced</span>
                  <span className="font-bold">{formatCurrency(revenueStats.invoicedAmount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Collected</span>
                  <span className="font-bold">{formatCurrency(revenueStats.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Outstanding</span>
                  <span className="font-bold">{formatCurrency(revenueStats.outstandingAmount)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quotation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['draft', 'sent', 'approved', 'rejected'].map(status => {
                  const count = quotations.filter(q => q.status === status).length
                  const percentage = quotations.length > 0 ? (count / quotations.length) * 100 : 0
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize">{status}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm w-8">{count}</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['draft', 'sent', 'paid', 'overdue'].map(status => {
                  const count = invoices.filter(i => i.status === status).length
                  const percentage = invoices.length > 0 ? (count / invoices.length) * 100 : 0
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize">{status}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm w-8">{count}</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['planning', 'in_progress', 'completed', 'on_hold'].map(status => {
                  const count = projects.filter(p => p.status === status).length
                  const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm w-8">{count}</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Installation Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['scheduled', 'in_progress', 'completed', 'on_hold'].map(status => {
                  const count = installations.filter(i => i.status === status).length
                  const percentage = installations.length > 0 ? (count / installations.length) * 100 : 0
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-cyan-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm w-8">{count}</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{leadStats.conversionRate}%</p>
                  <p className="text-sm text-gray-600">Lead Conversion Rate</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{performanceStats.averageInstallationProgress}%</p>
                  <p className="text-sm text-gray-600">Avg Installation Progress</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{performanceStats.completedProjects}</p>
                  <p className="text-sm text-gray-600">Projects Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
