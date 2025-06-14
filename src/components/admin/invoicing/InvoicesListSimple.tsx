'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Eye, Edit, Download, Send, CheckCircle, Clock, AlertTriangle, Trash2, Search, DollarSign, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"
import CreateInvoiceFormDialog from './CreateInvoiceFormDialog'

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

interface InvoicesListSimpleProps {
  invoices: Invoice[]
}

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FileText },
  sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent', icon: Send },
  paid: { color: 'bg-green-100 text-green-800', label: 'Paid', icon: CheckCircle },
  overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue', icon: AlertTriangle },
  cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled', icon: Clock }
}

export default function InvoicesListSimple({ invoices: initialInvoices }: InvoicesListSimpleProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [filteredInvoices, setFilteredInvoices] = useState(initialInvoices)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Filter invoices based on search and filters
  const handleFilter = () => {
    let filtered = invoices

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.projects?.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }

  // Update filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, invoices])

  const handleEdit = (invoiceId: string) => {
    router.push(`/admin/invoicing/edit/${invoiceId}`)
  }

  const handleDelete = async (invoiceId: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return
    }

    setIsDeleting(invoiceId)
    
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)

      if (error) {
        console.error('Error deleting invoice:', error)
        notify.error('Failed to delete invoice')
        return
      }

      // Update local state
      const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceId)
      setInvoices(updatedInvoices)
      setFilteredInvoices(filteredInvoices.filter(invoice => invoice.id !== invoiceId))
      
      notify.success('Invoice deleted successfully')
    } catch (error) {
      console.error('Error deleting invoice:', error)
      notify.error('Failed to delete invoice')
    } finally {
      setIsDeleting(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'paid' && new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Button onClick={() => router.push('/admin/invoicing/new')}>
          Create New Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-600 flex items-center">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>
      </div>

      {/* Invoices List */}
      <div className="grid gap-6">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600 mb-4">No invoices match your current filters.</p>
              <Button onClick={() => router.push('/admin/invoicing/new')}>
                Create First Invoice
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => {
            const StatusIcon = statusConfig[invoice.status]?.icon || FileText
            const overdue = isOverdue(invoice.due_date, invoice.status)
            
            return (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {invoice.invoice_number}
                      </h3>
                      {invoice.projects && (
                        <p className="text-sm text-gray-600">
                          Project: {invoice.projects.project_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusConfig[invoice.status]?.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[invoice.status]?.label}
                      </Badge>
                      {overdue && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium ml-1">{formatCurrency(invoice.total_amount)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Issue Date:</span>
                      <span className="font-medium ml-1">{formatDate(invoice.issue_date)}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Due Date:</span>
                      <span className={`font-medium ml-1 ${overdue ? 'text-red-600' : ''}`}>
                        {formatDate(invoice.due_date)}
                      </span>
                    </div>

                    {invoice.customers && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium ml-1">{invoice.customers.name}</span>
                      </div>
                    )}
                  </div>

                  {invoice.payment_terms && (
                    <p className="text-sm text-gray-600 mb-4">
                      Payment Terms: {invoice.payment_terms}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Created {formatDate(invoice.created_at)}
                      {invoice.created_by && (
                        <span> • By: {invoice.created_by.full_name}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(invoice.id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(invoice.id)}
                        disabled={isDeleting === invoice.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {isDeleting === invoice.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create Invoice Dialog */}
      {showCreateDialog && (
        <CreateInvoiceFormDialog
          employee={{} as any} // Will need proper employee data
          projects={[]}
          customers={[]}
          quotations={[]}
          onSuccess={() => {
            setShowCreateDialog(false)
            // Refresh invoices
            router.refresh()
          }}
          onCancel={() => setShowCreateDialog(false)}
        />
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          title="Create New Invoice"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
