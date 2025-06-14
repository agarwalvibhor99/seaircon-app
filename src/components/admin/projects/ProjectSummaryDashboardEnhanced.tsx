'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Users, 
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit,
  Eye,
  Plus,
  Receipt,
  CreditCard,
  Activity,
  Package,
  Phone,
  Mail,
  Building,
  Target,
  Zap
} from 'lucide-react'
import { Project, Quotation, Invoice, Payment, Customer, ProjectFinancialSummary } from '@/lib/enhanced-types-new'

interface ProjectSummaryDashboardEnhancedProps {
  project: Project
}

const statusColors: { [key: string]: string } = {
  draft: 'bg-gray-100 text-gray-800',
  planning: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  on_hold: 'bg-orange-100 text-orange-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  sent: 'bg-purple-100 text-purple-800',
  viewed: 'bg-indigo-100 text-indigo-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
  superseded: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  partial: 'bg-orange-100 text-orange-800'
}

const priorityColors: { [key: string]: string } = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export default function ProjectSummaryDashboardEnhanced({ project }: ProjectSummaryDashboardEnhancedProps) {
  const [enhancedProject, setEnhancedProject] = useState<Project>(project)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadProjectData()
  }, [project.id])

  const loadProjectData = async () => {
    try {
      setLoading(true)

      // Load all related data
      const [quotationsResult, invoicesResult, paymentsResult] = await Promise.all([
        supabase
          .from('quotations')
          .select('*')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('invoices')
          .select('*')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('payments')
          .select('*')
          .eq('project_id', project.id)
          .order('payment_date', { ascending: false })
      ])

      if (quotationsResult.data) setQuotations(quotationsResult.data)
      if (invoicesResult.data) setInvoices(invoicesResult.data)
      if (paymentsResult.data) setPayments(paymentsResult.data)
    } catch (error) {
      console.error('Error loading project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFinancialSummary = (): ProjectFinancialSummary => {
    const totalQuoted = quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0)
    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0)
    const totalReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const outstandingQuotes = quotations
      .filter(q => q.status === 'sent' || q.status === 'viewed')
      .reduce((sum, q) => sum + (q.total_amount || 0), 0)
    const outstandingInvoices = invoices
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + (i.balance_due || 0), 0)

    return {
      project_id: project.id,
      total_quoted: totalQuoted,
      total_invoiced: totalInvoiced,
      total_received: totalReceived,
      outstanding_quotes: outstandingQuotes,
      outstanding_invoices: outstandingInvoices,
      profit_margin: totalReceived > 0 ? ((totalReceived - (project.budget || 0)) / totalReceived) * 100 : 0
    }
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

  const getQuoteVersionInfo = (quotes: Quotation[]) => {
    const groupedByNumber = quotes.reduce((acc, quote) => {
      const baseNumber = quote.quote_number
      if (!acc[baseNumber]) {
        acc[baseNumber] = []
      }
      acc[baseNumber].push(quote)
      return acc
    }, {} as Record<string, Quotation[]>)

    return Object.entries(groupedByNumber).map(([number, versions]) => ({
      base_quote_number: number,
      current_version: versions.find(v => v.is_latest_version)?.version || 'v1',
      all_versions: versions.sort((a, b) => a.version.localeCompare(b.version)),
      latest_quote: versions.find(v => v.is_latest_version) || versions[0]
    }))
  }

  const financial = getFinancialSummary()
  const quoteVersions = getQuoteVersionInfo(quotations)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-cyan-50 to-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{project.project_name}</h1>
                <Badge className={statusColors[project.status] || 'bg-gray-100 text-gray-800'}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={priorityColors[project.priority] || 'bg-gray-100 text-gray-800'}>
                  {project.priority.toUpperCase()}
                </Badge>
              </div>
              <p className="text-gray-600 text-lg">{project.project_number}</p>
              {project.description && (
                <p className="text-gray-700 max-w-2xl">{project.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Customer */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.customer ? (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">{project.customer.name}</h3>
                {project.customer.company && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Building className="h-3 w-3 mr-1" />
                    {project.customer.company}
                  </p>
                )}
                {project.customer.phone && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {project.customer.phone}
                  </p>
                )}
                {project.customer.email && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {project.customer.email}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No customer assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Project Manager */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Project Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.project_manager ? (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">{project.project_manager.full_name}</h3>
                <p className="text-sm text-gray-600">{project.project_manager.role}</p>
                {project.project_manager.email && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {project.project_manager.email}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No manager assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.start_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Start:</span>
                  <span className="font-medium">{formatDate(project.start_date)}</span>
                </div>
              )}
              {project.estimated_completion && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Est. End:</span>
                  <span className="font-medium">{formatDate(project.estimated_completion)}</span>
                </div>
              )}
              {project.actual_completion && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-green-600">{formatDate(project.actual_completion)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDate(project.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.address && (
                <p className="text-sm text-gray-900">{project.address}</p>
              )}
              {(project.city || project.state || project.postal_code) && (
                <p className="text-sm text-gray-600">
                  {[project.city, project.state, project.postal_code].filter(Boolean).join(', ')}
                </p>
              )}
              {project.project_type && (
                <Badge variant="outline" className="text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  {project.project_type.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(financial.total_quoted)}</div>
              <div className="text-sm text-gray-600">Total Quoted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(financial.total_invoiced)}</div>
              <div className="text-sm text-gray-600">Total Invoiced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(financial.total_received)}</div>
              <div className="text-sm text-gray-600">Total Received</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(financial.outstanding_quotes)}</div>
              <div className="text-sm text-gray-600">Outstanding Quotes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(financial.outstanding_invoices)}</div>
              <div className="text-sm text-gray-600">Outstanding Invoices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {financial.profit_margin ? `${financial.profit_margin.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Profit Margin</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes, Invoices, and Payments Tabs */}
      <Tabs defaultValue="quotes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Quotes ({quotations.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments ({payments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Quotations</CardTitle>
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4 mr-1" />
                Create Quote
              </Button>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotations yet</h3>
                  <p className="text-gray-600 mb-4">Create your first quotation for this project.</p>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quotation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quoteVersions.map((versionInfo) => (
                    <div key={versionInfo.base_quote_number} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{versionInfo.base_quote_number}</h4>
                          <Badge variant="outline" className="text-xs">
                            {versionInfo.current_version} ({versionInfo.all_versions.length} versions)
                          </Badge>
                          <Badge className={statusColors[versionInfo.latest_quote.status] || 'bg-gray-100 text-gray-800'}>
                            {versionInfo.latest_quote.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(versionInfo.latest_quote.total_amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(versionInfo.latest_quote.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      {versionInfo.all_versions.length > 1 && (
                        <div className="mt-3 pt-3 border-t">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Version History:</h5>
                          <div className="flex gap-2 flex-wrap">
                            {versionInfo.all_versions.map((version) => (
                              <Badge 
                                key={version.id} 
                                variant={version.is_latest_version ? "default" : "outline"}
                                className="text-xs"
                              >
                                {version.version} - {formatCurrency(version.total_amount)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Invoices</CardTitle>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-1" />
                Create Invoice
              </Button>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h3>
                  <p className="text-gray-600 mb-4">Create your first invoice for this project.</p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{invoice.invoice_number}</h4>
                          <Badge className={statusColors[invoice.status] || 'bg-gray-100 text-gray-800'}>
                            {invoice.status}
                          </Badge>
                          {invoice.quote_ids && invoice.quote_ids.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              From {invoice.quote_ids.length} quote(s)
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(invoice.total_amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Due: {formatDate(invoice.due_date)}
                          </div>
                          {invoice.balance_due > 0 && (
                            <div className="text-sm text-red-600">
                              Balance: {formatCurrency(invoice.balance_due)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Payments</CardTitle>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Record Payment
              </Button>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments yet</h3>
                  <p className="text-gray-600 mb-4">Record your first payment for this project.</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{payment.payment_reference}</h4>
                          <Badge className={statusColors[payment.status] || 'bg-gray-100 text-gray-800'}>
                            {payment.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {payment.payment_mode}
                          </Badge>
                          {payment.is_partial_payment && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              Partial
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(payment.payment_date)}
                          </div>
                          {payment.remaining_balance && payment.remaining_balance > 0 && (
                            <div className="text-sm text-orange-600">
                              Remaining: {formatCurrency(payment.remaining_balance)}
                            </div>
                          )}
                        </div>
                      </div>
                      {payment.note && (
                        <div className="mt-2 text-sm text-gray-600">
                          {payment.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
