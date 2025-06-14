'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Download, FileText, Receipt } from 'lucide-react'

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

interface PaymentsListProps {
  payments: Payment[]
}

export default function PaymentsList({ payments }: PaymentsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // Filter payments based on search and filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.payment_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoices?.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoices?.customers.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesMethod = methodFilter === '' || payment.payment_method === methodFilter
    
    const matchesDate = dateFilter === '' || (() => {
      const paymentDate = new Date(payment.payment_date)
      const now = new Date()
      
      switch (dateFilter) {
        case 'today':
          return paymentDate.toDateString() === now.toDateString()
        case 'this_week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return paymentDate >= weekAgo
        case 'this_month':
          return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })()

    return matchesSearch && matchesMethod && matchesDate
  })

  // Export to Excel function
  const exportToExcel = async () => {
    const XLSX = await import('xlsx')
    
    const exportData = filteredPayments.map(payment => ({
      'Payment Reference': payment.payment_reference,
      'Invoice Number': payment.invoices?.invoice_number || 'N/A',
      'Customer': payment.invoices?.customers.name || 'N/A',
      'Customer Phone': payment.invoices?.customers.phone || 'N/A',
      'Amount': payment.amount,
      'Payment Date': new Date(payment.payment_date).toLocaleDateString(),
      'Payment Method': payment.payment_method.replace('_', ' ').toUpperCase(),
      'Transaction ID': payment.transaction_id || 'N/A',
      'Recorded By': payment.recorded_by?.full_name || 'N/A',
      'Notes': payment.notes || 'N/A',
      'Created At': new Date(payment.created_at).toLocaleDateString()
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
  }

  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment Records
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search payments, invoices, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            {/* Filters */}
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Ref</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Invoice</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Recorded By</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{payment.payment_reference}</div>
                      {payment.transaction_id && (
                        <div className="text-xs text-gray-500">TXN: {payment.transaction_id}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900">
                        {payment.invoices?.invoice_number || 'Direct Payment'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900">
                        {payment.invoices?.customers.name || 'N/A'}
                      </div>
                      {payment.invoices?.customers.phone && (
                        <div className="text-xs text-gray-500">
                          {payment.invoices.customers.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-green-600">
                        ₹{payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {formatPaymentMethod(payment.payment_method)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900">
                        {payment.recorded_by?.full_name || 'System'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            // View payment details logic
                          }}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No payments found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {filteredPayments.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                Showing {filteredPayments.length} of {payments.length} payments
              </span>
              <span className="text-lg font-semibold text-gray-900">
                Total: ₹{filteredPayments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
