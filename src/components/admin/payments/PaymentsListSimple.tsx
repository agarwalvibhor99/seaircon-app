'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Receipt, Edit, Trash2, Search, DollarSign, Calendar, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"
import CreatePaymentFormDialog from './CreatePaymentFormDialog'

interface Payment {
  id: string
  payment_reference: string
  amount: number
  payment_date: string
  payment_method: string
  transaction_id: string
  notes: string
  invoices: {
    invoice_number: string
    total_amount: number
    customers: {
      name: string
      phone: string
    }
  } | null
  recorded_by: {
    full_name: string
  } | null
  created_at: string
}

interface PaymentsListSimpleProps {
  payments: Payment[]
}

const paymentMethodConfig = {
  'cash': { color: 'bg-green-100 text-green-800', label: 'Cash' },
  'bank_transfer': { color: 'bg-blue-100 text-blue-800', label: 'Bank Transfer' },
  'cheque': { color: 'bg-yellow-100 text-yellow-800', label: 'Cheque' },
  'upi': { color: 'bg-purple-100 text-purple-800', label: 'UPI' },
  'card': { color: 'bg-orange-100 text-orange-800', label: 'Card' },
  'other': { color: 'bg-gray-100 text-gray-800', label: 'Other' }
}

export default function PaymentsListSimple({ payments: initialPayments }: PaymentsListSimpleProps) {
  const [payments, setPayments] = useState(initialPayments)
  const [filteredPayments, setFilteredPayments] = useState(initialPayments)
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Filter payments based on search and filters
  const handleFilter = () => {
    let filtered = payments

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.payment_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoices?.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoices?.customers.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.payment_method === methodFilter)
    }

    setFilteredPayments(filtered)
  }

  // Update filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, methodFilter, payments])

  const handleEdit = (paymentId: string) => {
    router.push(`/admin/payments/edit/${paymentId}`)
  }

  const handleDelete = async (paymentId: string) => {
    if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return
    }

    setIsDeleting(paymentId)
    
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId)

      if (error) {
        console.error('Error deleting payment:', error)
        notify.error('Failed to delete payment')
        return
      }

      // Update local state
      const updatedPayments = payments.filter(payment => payment.id !== paymentId)
      setPayments(updatedPayments)
      setFilteredPayments(filteredPayments.filter(payment => payment.id !== paymentId))
      
      notify.success('Payment deleted successfully')
    } catch (error) {
      console.error('Error deleting payment:', error)
      notify.error('Failed to delete payment')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <Button onClick={() => router.push('/admin/payments/new')}>
          Record New Payment
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-600 flex items-center">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      </div>

      {/* Payments List */}
      <div className="grid gap-6">
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600 mb-4">No payments match your current filters.</p>
              <Button onClick={() => router.push('/admin/payments/new')}>
                Record First Payment
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => {
            const methodConfig = paymentMethodConfig[payment.payment_method as keyof typeof paymentMethodConfig] || paymentMethodConfig.other
            
            return (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {payment.payment_reference}
                      </h3>
                      {payment.invoices && (
                        <p className="text-sm text-gray-600">
                          Invoice: {payment.invoices.invoice_number}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={methodConfig.color}>
                        {methodConfig.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium ml-1">{formatCurrency(payment.amount)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium ml-1">{formatDate(payment.payment_date)}</span>
                    </div>

                    {payment.transaction_id && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium ml-1">{payment.transaction_id}</span>
                      </div>
                    )}

                    {payment.invoices?.customers && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium ml-1">{payment.invoices.customers.name}</span>
                      </div>
                    )}
                  </div>

                  {payment.notes && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{payment.notes}</p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Recorded {formatDate(payment.created_at)}
                      {payment.recorded_by && (
                        <span> • By: {payment.recorded_by.full_name}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(payment.id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(payment.id)}
                        disabled={isDeleting === payment.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {isDeleting === payment.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create Payment Dialog */}
      {showCreateDialog && (
        <CreatePaymentFormDialog
          employee={{} as any} // Will need proper employee data
          invoices={[]}
          customers={[]}
          onSuccess={() => {
            setShowCreateDialog(false)
            // Refresh payments
            router.refresh()
          }}
          onCancel={() => setShowCreateDialog(false)}
        />
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          title="Record New Payment"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
