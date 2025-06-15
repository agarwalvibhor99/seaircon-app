'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Eye, Edit, Download, Send, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react'
import { useInvoiceFormManager } from '@/components/ui/unified-form-manager'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { SectionHeader, SearchFilterBar } from '@/components/ui/section-header'
import { getStatusConfig } from '@/lib/design-system'

interface Invoice {
  id: string
  invoice_number: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  total_amount: number
  due_date: string
  issue_date: string
  created_at: string
  projects?: { project_name: string; project_number: string }
  customers?: { name: string; phone: string; email: string }
  created_by?: { full_name: string }
  payment_terms?: string
  notes?: string
}

interface InvoicesListProps {
  invoices: Invoice[]
  projects?: any[]
  customers?: any[]
}

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FileText },
  sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent', icon: Send },
  paid: { color: 'bg-green-100 text-green-800', label: 'Paid', icon: CheckCircle },
  overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue', icon: AlertTriangle },
  cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled', icon: Clock }
}

export default function InvoicesList({ invoices, projects = [], customers = [] }: InvoicesListProps) {
  const [filteredInvoices, setFilteredInvoices] = useState(invoices)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Unified form manager for invoices
  const {
    openCreateModal,
    FormModal: CreateInvoiceModal
  } = useInvoiceFormManager(projects, customers, () => {
    // Refresh data after successful creation
    window.location.reload()
  })

  // Filter invoices based on search and filters
  const handleFilter = () => {
    let filtered = invoices

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.projects?.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.projects?.project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customers?.phone.includes(searchTerm) ||
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
  }, [searchTerm, statusFilter, invoices])

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

  const isOverdue = (dueDate: string, status: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    return due < today && (status === 'sent' || status === 'overdue')
  }

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Invoices Management"
        description="Create, manage and track customer invoices"
        primaryAction={{
          label: "Create Invoice",
          onClick: openCreateModal
        }}
      />

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: "Status",
            value: statusFilter,
            options: [
              { value: "all", label: "All Status" },
              { value: "draft", label: "Draft" },
              { value: "sent", label: "Sent" },
              { value: "paid", label: "Paid" },
              { value: "overdue", label: "Overdue" },
              { value: "cancelled", label: "Cancelled" }
            ],
            onChange: setStatusFilter
          }
        ]}
      />

      {/* Invoices List */}
      <div className="grid gap-4">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-500">
                {invoices.length === 0 
                  ? "No invoices have been created yet."
                  : "No invoices match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => {
            const StatusIcon = statusConfig[invoice.status].icon
            const overdue = isOverdue(invoice.due_date, invoice.status)
            const daysOverdue = getDaysOverdue(invoice.due_date)
            
            return (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {invoice.invoice_number}
                        </h3>
                        <Badge className={statusConfig[invoice.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[invoice.status].label}
                        </Badge>
                        {overdue && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {daysOverdue} days overdue
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Project:</span>
                          <br />
                          {invoice.projects?.project_name || 'N/A'}
                          {invoice.projects?.project_number && (
                            <span className="text-xs text-gray-500 block">
                              #{invoice.projects.project_number}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <span className="font-medium">Customer:</span>
                          <br />
                          {invoice.customers?.name || 'N/A'}
                        </div>
                        
                        <div>
                          <span className="font-medium">Amount:</span>
                          <br />
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(invoice.total_amount)}
                          </span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Due Date:</span>
                          <br />
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>
                            {formatDate(invoice.due_date)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>Issue Date: {formatDate(invoice.issue_date)}</span>
                        <span>Created by: {invoice.created_by?.full_name}</span>
                        {invoice.payment_terms && (
                          <span>Terms: {invoice.payment_terms}</span>
                        )}
                      </div>

                      {invoice.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{invoice.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {invoice.status === 'draft' && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      
                      {invoice.status === 'draft' && (
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      )}
                      
                      {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Paid
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

      {/* Unified Invoice Form */}
      <CreateInvoiceModal />

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={openCreateModal}
        variant="monochrome"
      />
    </div>
  )
}
