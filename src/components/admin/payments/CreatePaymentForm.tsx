'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Save, Receipt, ArrowLeft, Search } from 'lucide-react'
import { showToast } from '@/lib/toast.service'

interface Employee {
  id: string
  full_name: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Invoice {
  id: string
  invoice_number: string
  total_amount: number
  amount_paid: number
  balance_due: number
  customer_id: string
  customers: Customer
}

interface CreatePaymentFormProps {
  employee: Employee
  invoices: Invoice[]
  customers: Customer[]
}

export default function CreatePaymentForm({ 
  employee, 
  invoices, 
  customers 
}: CreatePaymentFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  
  const [formData, setFormData] = useState({
    payment_reference: `PAY-${Date.now()}`,
    invoice_id: '',
    customer_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    transaction_id: '',
    receipt_number: '',
    notes: '',
    recorded_by: employee.id
  })

  // Filter invoices that have outstanding balance
  const unpaidInvoices = invoices.filter(invoice => invoice.balance_due > 0)

  // Handle invoice selection
  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      setSelectedInvoice(invoice)
      setFormData(prev => ({
        ...prev,
        invoice_id: invoiceId,
        customer_id: invoice.customer_id,
        amount: invoice.balance_due.toString()
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate amount
      const paymentAmount = parseFloat(formData.amount)
      if (paymentAmount <= 0) {
        showToast('error', 'Payment amount must be greater than zero')
        return
      }

      if (selectedInvoice && paymentAmount > selectedInvoice.balance_due) {
        showToast('error', 'Payment amount cannot exceed balance due')
        return
      }

      // Create payment via API
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: paymentAmount
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to record payment')
      }

      showToast('success', 'Payment recorded successfully!')
      router.push('/admin/payments')
    } catch (error) {
      console.error('Error recording payment:', error)
      showToast('error', error instanceof Error ? error.message : 'Error recording payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-gray-600">Record a payment against an invoice or customer account</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Payment Reference *</Label>
                <Input
                  value={formData.payment_reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_reference: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Payment Date *</Label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Payment Method *</Label>
                <Select 
                  value={formData.payment_method} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card Payment</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transaction ID / Reference</Label>
                <Input
                  value={formData.transaction_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, transaction_id: e.target.value }))}
                  placeholder="Bank reference, UPI ID, etc."
                />
              </div>
            </div>

            <div>
              <Label>Receipt Number</Label>
              <Input
                value={formData.receipt_number}
                onChange={(e) => setFormData(prev => ({ ...prev, receipt_number: e.target.value }))}
                placeholder="Physical receipt number (if applicable)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice & Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Invoice *</Label>
              <Select 
                value={formData.invoice_id} 
                onValueChange={handleInvoiceSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an invoice with outstanding balance" />
                </SelectTrigger>
                <SelectContent>
                  {unpaidInvoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} - {invoice.customers.name} - ₹{invoice.balance_due.toLocaleString()} due
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedInvoice && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Invoice:</span>
                  <span>{selectedInvoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span>{selectedInvoice.customers.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span>₹{selectedInvoice.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount Paid:</span>
                  <span>₹{selectedInvoice.amount_paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-red-600">Balance Due:</span>
                  <span className="text-red-600 font-bold">₹{selectedInvoice.balance_due.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div>
              <Label>Payment Amount *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                placeholder="Enter payment amount"
              />
              {selectedInvoice && parseFloat(formData.amount) > selectedInvoice.balance_due && (
                <p className="text-red-500 text-sm mt-1">
                  Amount cannot exceed balance due of ₹{selectedInvoice.balance_due.toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this payment..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Recording...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Record Payment
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
