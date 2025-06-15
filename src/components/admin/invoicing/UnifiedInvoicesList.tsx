'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Eye, Edit, Download, Send, CheckCircle, XCircle, Clock, AlertTriangle, Search, Filter, X, Plus } from 'lucide-react'
import { Employee, Customer, Project } from '@/lib/enhanced-types'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { useInvoiceFormManager } from '@/components/ui/unified-form-manager'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"

interface Invoice {
  id: string
  invoice_number: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  total_amount: number
  due_date: string
  created_at: string
  project?: { project_name: string; project_number: string }
  customer?: { name: string; phone: string; email: string }
  created_by?: { full_name: string }
  notes?: string
}

interface UnifiedInvoicesListProps {
  invoices: Invoice[]
  employee: Employee
  customers: Customer[]
  projects: Project[]
}

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FileText },
  sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent', icon: Send },
  paid: { color: 'bg-green-100 text-green-800', label: 'Paid', icon: CheckCircle },
  overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue', icon: AlertTriangle },
  cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled', icon: XCircle }
}

export default function UnifiedInvoicesList({ invoices, employee, customers, projects }: UnifiedInvoicesListProps) {
  const [filteredInvoices, setFilteredInvoices] = useState(invoices)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [currentInvoices, setCurrentInvoices] = useState(invoices)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Initialize form manager with unified system
  const createFormModal = useInvoiceFormManager(projects, customers, refreshData)

  // Refresh invoices data
  async function refreshData() {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          project:projects(project_name, project_number),
          customer:customers(name, phone, email),
          created_by:employees!invoices_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCurrentInvoices(data || [])
      setFilteredInvoices(data || [])
      notify.success('Invoices refreshed successfully')
    } catch (error) {
      console.error('Error refreshing invoices:', error)
      notify.error('Failed to refresh invoices')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter invoices based on search and filters
  const handleFilter = () => {
    let filtered = currentInvoices

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.project?.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.project?.project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer?.phone.includes(searchTerm) ||
        invoice.created_by?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }

  // Apply filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, currentInvoices])

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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  const getStatusPriority = (status: string, dueDate: string) => {
    if (status === 'overdue') return 3
    if (status === 'sent' && new Date(dueDate) < new Date()) return 2
    if (status === 'sent') return 1
    return 0
  }

  // Sort invoices by status priority
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    const priorityA = getStatusPriority(a.status, a.due_date)
    const priorityB = getStatusPriority(b.status, b.due_date)
    return priorityB - priorityA
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-sm text-gray-600">Manage customer invoices and billing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
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
                  placeholder="Search by invoice number, project, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-white/30"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/50 border-white/30">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
      {(searchTerm || statusFilter !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>
            Showing {filteredInvoices.length} of {currentInvoices.length} invoices
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
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

      {/* Invoices Grid */}
      {sortedInvoices.length === 0 ? (
        <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No matching invoices found' : 'No invoices yet'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search terms or filters' 
                : 'Create your first invoice to get started'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Button
                onClick={createFormModal.openCreateModal}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create First Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedInvoices.map((invoice) => {
            const StatusIcon = statusConfig[invoice.status]?.icon || FileText
            const isOverdue = invoice.status === 'sent' && new Date(invoice.due_date) < new Date()
            
            return (
              <Card key={invoice.id} className={`group hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/70 border-white/20 shadow-lg hover:bg-white/80 ${isOverdue ? 'ring-2 ring-red-200' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {invoice.invoice_number}
                      </CardTitle>
                      <p className="text-sm text-gray-600 truncate">
                        {invoice.project?.project_name || 'No Project'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {invoice.customer?.name || 'N/A'}
                      </p>
                    </div>
                    <Badge className={`${statusConfig[invoice.status]?.color} flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[invoice.status]?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-green-700">{formatCurrency(invoice.total_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Due Date:</span>
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>{formatDate(invoice.due_date)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span>{formatDate(invoice.created_at)}</span>
                    </div>
                    {invoice.created_by?.full_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Created by:</span>
                        <span className="truncate ml-2">{invoice.created_by.full_name}</span>
                      </div>
                    )}
                  </div>

                  {isOverdue && (
                    <div className="flex items-center gap-1 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Payment Overdue</span>
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
                      onClick={() => createFormModal.openEditModal(invoice)}
                      className="flex-1 bg-white/50 border-white/30 hover:bg-white/70"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/50 border-white/30 hover:bg-white/70"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
        label="Create New Invoice"
        variant="monochrome"
      />

      {/* Form Modal */}
      <createFormModal.FormModal />
    </div>
  )
}
