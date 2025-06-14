'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Plus
} from 'lucide-react'
import { Project, Quotation, Invoice, Payment, Customer } from '@/lib/enhanced-types'
import ProjectActivityTimeline from './ProjectActivityTimeline'
import Link from 'next/link'

interface ProjectSummaryDashboardProps {
  projectId: string
}

interface ProjectSummary extends Project {
  quotations: Quotation[]
  invoices: Invoice[]
  payments: Payment[]
  customer: Customer
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
  overdue: 'bg-red-100 text-red-800',
  partial: 'bg-yellow-100 text-yellow-800'
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export default function ProjectSummaryDashboard({ projectId }: ProjectSummaryDashboardProps) {
  const [project, setProject] = useState<ProjectSummary | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchProjectSummary()
  }, [projectId])

  const fetchProjectSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customer:customers(*),
          quotations(
            *,
            quote_items:quotation_items(*)
          ),
          invoices(
            *,
            invoice_items:invoice_items(*)
          ),
          payments(*)
        `)
        .eq('id', projectId)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error('Error fetching project summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Not Found</h3>
        <p className="text-gray-600">The requested project could not be found.</p>
      </div>
    )
  }

  // Calculate financial summary
  const totalQuotedAmount = project.quotations.reduce((sum, q) => sum + q.total_amount, 0)
  const totalInvoicedAmount = project.invoices.reduce((sum, i) => sum + i.total_amount, 0)
  const totalPaidAmount = project.payments.reduce((sum, p) => sum + p.amount, 0)
  const totalOutstanding = totalInvoicedAmount - totalPaidAmount

  // Calculate progress
  const progressPercentage = project.estimated_value > 0 
    ? Math.min((totalPaidAmount / project.estimated_value) * 100, 100)
    : 0

  // Status counts
  const approvedQuotes = project.quotations.filter(q => q.status === 'approved').length
  const sentQuotes = project.quotations.filter(q => q.status === 'sent').length
  const paidInvoices = project.invoices.filter(i => i.status === 'paid').length
  const pendingInvoices = project.invoices.filter(i => i.status === 'sent' || i.status === 'draft').length

  return (
    <div className="space-y-8">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{project.project_name}</h1>
              <Badge className={statusColors[project.status]}>
                {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
              <Badge className={priorityColors[project.priority]}>
                {project.priority.toUpperCase()} Priority
              </Badge>
            </div>
            <p className="text-blue-100 mb-4">{project.project_number}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{project.customer?.name || 'No Customer'}</span>
              </div>
              {project.project_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{project.project_address}</span>
                </div>
              )}
              {project.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Started: {new Date(project.start_date).toLocaleDateString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href={`/admin/projects/${projectId}/edit`}>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Project Value</p>
                <p className="text-2xl font-bold">₹{project.estimated_value.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{totalPaidAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">₹{totalOutstanding.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Project Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹0</span>
              <span>₹{project.estimated_value.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quotations Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quotations ({project.quotations.length})
            </CardTitle>
            <Link href={`/admin/quotations`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Quote
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Approved</p>
                  <p className="text-lg font-semibold text-green-600">{approvedQuotes}</p>
                </div>
                <div>
                  <p className="text-gray-600">Sent</p>
                  <p className="text-lg font-semibold text-blue-600">{sentQuotes}</p>
                </div>
              </div>
              
              {project.quotations.length > 0 ? (
                <div className="space-y-2">
                  {project.quotations.slice(0, 3).map(quote => (
                    <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{quote.quote_number}</p>
                        <p className="text-sm text-gray-600">₹{quote.total_amount.toLocaleString('en-IN')}</p>
                      </div>
                      <Badge className={statusColors[quote.status]}>
                        {quote.status}
                      </Badge>
                    </div>
                  ))}
                  {project.quotations.length > 3 && (
                    <Link href={`/admin/quotations?project_id=${projectId}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View All Quotations
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No quotations created yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoices & Payments Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Invoices & Payments
            </CardTitle>
            <Link href={`/admin/invoicing`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Invoice
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Paid Invoices</p>
                  <p className="text-lg font-semibold text-green-600">{paidInvoices}</p>
                </div>
                <div>
                  <p className="text-gray-600">Pending</p>
                  <p className="text-lg font-semibold text-orange-600">{pendingInvoices}</p>
                </div>
              </div>
              
              {project.invoices.length > 0 ? (
                <div className="space-y-2">
                  {project.invoices.slice(0, 3).map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-600">₹{invoice.balance_due.toLocaleString('en-IN')} due</p>
                      </div>
                      <Badge className={statusColors[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </div>
                  ))}
                  {project.invoices.length > 3 && (
                    <Link href={`/admin/invoicing?project_id=${projectId}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View All Invoices
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No invoices created yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <ProjectActivityTimeline projectId={projectId} />
    </div>
  )
}
