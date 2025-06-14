'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Receipt, Eye, Edit, Download, Search, Filter, X, Plus, CreditCard, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { Employee } from '@/lib/enhanced-types'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { usePaymentFormManager } from '@/components/ui/unified-form-manager'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"

interface Invoice {
  id: string
  invoice_number: string
  total_amount: number
  customer?: { name: string; phone: string; email: string }
}

interface Payment {
  id: string
  payment_reference: string
  amount: number
  payment_date: string
  payment_method: 'cash' | 'cheque' | 'bank_transfer' | 'card' | 'upi' | 'other'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  notes?: string
  invoice?: {
    invoice_number: string
    total_amount: number
    customer?: { name: string; phone: string; email: string }
  }
  recorded_by?: { full_name: string }
  created_at: string
}

interface UnifiedPaymentsListProps {
  payments: Payment[]
  employee: Employee
  invoices: Invoice[]
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
  completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
  failed: { color: 'bg-red-100 text-red-800', label: 'Failed', icon: AlertTriangle },
  refunded: { color: 'bg-orange-100 text-orange-800', label: 'Refunded', icon: Receipt }
}

const methodConfig = {
  cash: { color: 'bg-green-100 text-green-800', label: 'Cash' },
  cheque: { color: 'bg-blue-100 text-blue-800', label: 'Cheque' },
  bank_transfer: { color: 'bg-purple-100 text-purple-800', label: 'Bank Transfer' },
  card: { color: 'bg-indigo-100 text-indigo-800', label: 'Card' },
  upi: { color: 'bg-orange-100 text-orange-800', label: 'UPI' },
  other: { color: 'bg-gray-100 text-gray-800', label: 'Other' }
}

export default function UnifiedPaymentsList({ payments, employee, invoices }: UnifiedPaymentsListProps) {
  const [filteredPayments, setFilteredPayments] = useState(payments)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPayments, setCurrentPayments] = useState(payments)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Initialize form manager with unified system
  const createFormModal = usePaymentFormManager(invoices, refreshData)

  // Refresh payments data
  async function refreshData() {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          invoice:invoices(
            invoice_number, 
            total_amount,
            customer:customers(name, phone, email)
          ),
          recorded_by:employees!payments_recorded_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCurrentPayments(data || [])
      setFilteredPayments(data || [])
      notify.success('Payments refreshed successfully')
    } catch (error) {
      console.error('Error refreshing payments:', error)
      notify.error('Failed to refresh payments')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter payments based on search and filters
  const handleFilter = () => {
    let filtered = currentPayments

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.payment_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice?.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice?.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice?.customer?.phone.includes(searchTerm) ||
        payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.recorded_by?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.payment_method === methodFilter)
    }

    setFilteredPayments(filtered)
  }

  // Apply filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, methodFilter, currentPayments])

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
    setMethodFilter('all')
  }

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx')
      
      const exportData = filteredPayments.map(payment => ({
        'Payment Reference': payment.payment_reference,
        'Invoice Number': payment.invoice?.invoice_number || 'N/A',
        'Customer': payment.invoice?.customer?.name || 'N/A',
        'Customer Phone': payment.invoice?.customer?.phone || 'N/A',
        'Amount': payment.amount,
        'Payment Date': formatDate(payment.payment_date),
        'Payment Method': methodConfig[payment.payment_method]?.label || payment.payment_method,
        'Status': statusConfig[payment.status]?.label || payment.status,
        'Transaction ID': payment.transaction_id || 'N/A',
        'Recorded By': payment.recorded_by?.full_name || 'N/A',
        'Notes': payment.notes || 'N/A',
        'Created At': formatDate(payment.created_at)
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)
      
      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }))
      ws['!cols'] = colWidths
      
      XLSX.utils.book_append_sheet(wb, ws, 'Payments')
      XLSX.writeFile(wb, `SE_Aircon_Payments_${new Date().toISOString().split('T')[0]}.xlsx`)
      
      notify.success('Payment data exported successfully')
    } catch (error) {
      console.error('Error exporting data:', error)
      notify.error('Failed to export payment data')
    }
  }

  // Sort payments by status priority (pending/failed first)
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const priorityOrder = { pending: 3, failed: 2, completed: 1, refunded: 0 }
    return (priorityOrder[b.status] || 0) - (priorityOrder[a.status] || 0)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
          <p className="text-sm text-gray-600">Track and manage payment records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Receipt className="h-4 w-4" />
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
                  placeholder="Search by payment reference, invoice, customer..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-36 bg-white/50 border-white/30">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
      {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>
            Showing {filteredPayments.length} of {currentPayments.length} payments
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
            {methodFilter !== 'all' && ` via "${methodFilter}"`}
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

      {/* Payments Grid */}
      {sortedPayments.length === 0 ? (
        <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' ? 'No matching payments found' : 'No payments yet'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || methodFilter !== 'all'
                ? 'Try adjusting your search terms or filters' 
                : 'Record your first payment to get started'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && methodFilter === 'all') && (
              <Button
                onClick={createFormModal.openCreateModal}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Record First Payment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedPayments.map((payment) => {
            const StatusIcon = statusConfig[payment.status]?.icon || Receipt
            const isHighPriority = payment.status === 'pending' || payment.status === 'failed'
            
            return (
              <Card key={payment.id} className={`group hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/70 border-white/20 shadow-lg hover:bg-white/80 ${isHighPriority ? 'ring-2 ring-yellow-200' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                        {payment.payment_reference}
                      </CardTitle>
                      <p className="text-sm text-gray-600 truncate">
                        {payment.invoice?.invoice_number || 'No Invoice'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {payment.invoice?.customer?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={`${statusConfig[payment.status]?.color} flex items-center gap-1 text-xs`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[payment.status]?.label}
                      </Badge>
                      <Badge className={`${methodConfig[payment.payment_method]?.color} text-xs`}>
                        {methodConfig[payment.payment_method]?.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-green-700">{formatCurrency(payment.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span>{formatDate(payment.payment_date)}</span>
                    </div>
                    {payment.transaction_id && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transaction:</span>
                        <span className="truncate ml-2 font-mono text-xs">{payment.transaction_id}</span>
                      </div>
                    )}
                    {payment.recorded_by?.full_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Recorded by:</span>
                        <span className="truncate ml-2">{payment.recorded_by.full_name}</span>
                      </div>
                    )}
                  </div>

                  {payment.status === 'pending' && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                      <Clock className="h-4 w-4" />
                      <span>Payment Pending</span>
                    </div>
                  )}

                  {payment.status === 'failed' && (
                    <div className="flex items-center gap-1 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Payment Failed</span>
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
                      onClick={() => createFormModal.openEditModal(payment)}
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
        label="Record New Payment"
        gradientFrom="from-green-500"
        gradientTo="to-emerald-500"
      />

      {/* Form Modal */}
      <createFormModal.FormModal />
    </div>
  )
}
