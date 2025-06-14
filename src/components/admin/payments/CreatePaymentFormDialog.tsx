'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Save, Receipt, CreditCard, DollarSign, User, Calendar, FileText, AlertCircle } from 'lucide-react'
import { notify } from "@/lib/toast"
import { Payment, Invoice, Project, Quotation, Customer, Employee } from '@/lib/enhanced-types'

interface CreatePaymentFormDialogProps {
  employee: Employee
  invoices: Invoice[]
  projects?: Project[]
  quotations?: Quotation[]
  customers: Customer[]
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CreatePaymentFormDialog({ 
  employee, 
  invoices,
  projects = [],
  quotations = [],
  customers,
  onSuccess,
  onCancel
}: CreatePaymentFormDialogProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0'
    }

    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required'
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required'
    }

    if (formData.payment_method !== 'cash' && !formData.transaction_id.trim()) {
      newErrors.transaction_id = 'Transaction ID is required for non-cash payments'
    }

    // Validate amount against invoice if selected
    if (selectedInvoice && parseFloat(formData.amount) > selectedInvoice.total_amount) {
      newErrors.amount = 'Payment amount cannot exceed invoice amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle invoice selection
  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      setSelectedInvoice(invoice)
      setFormData(prev => ({
        ...prev,
        invoice_id: invoiceId,
        customer_id: invoice.customer_id,
        amount: invoice.total_amount.toString()
      }))
    } else {
      setSelectedInvoice(null)
      setFormData(prev => ({
        ...prev,
        invoice_id: '',
        amount: ''
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      notify.error('Please fix the errors and try again')
      return
    }

    setLoading(true)

    try {
      // Create payment record
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        invoice_id: formData.invoice_id || null
      }

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single()

      if (paymentError) throw paymentError

      // Update invoice payment status if linked
      if (formData.invoice_id && selectedInvoice) {
        const currentPaidAmount = (selectedInvoice as any).paid_amount || 0
        const totalPaid = currentPaidAmount + parseFloat(formData.amount)
        const newStatus = totalPaid >= selectedInvoice.total_amount ? 'paid' : 'partially_paid'
        
        await supabase
          .from('invoices')
          .update({ 
            paid_amount: totalPaid,
            payment_status: newStatus
          })
          .eq('id', formData.invoice_id)
      }

      notify.success('Payment recorded successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error recording payment:', error)
      notify.error('Failed to record payment', 'Please check the form and try again')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const paymentMethodOptions = [
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'cheque', label: 'Cheque', icon: '📋' },
    { value: 'upi', label: 'UPI', icon: '📱' },
    { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
    { value: 'online', label: 'Online Payment', icon: '🌐' }
  ]

  const filteredInvoices = invoices.filter(inv => 
    !formData.customer_id || inv.customer_id === formData.customer_id
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="customer_id">Customer *</Label>
            <Select value={formData.customer_id} onValueChange={(value) => handleInputChange('customer_id', value)}>
              <SelectTrigger className={errors.customer_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customer_id && <p className="text-sm text-red-500 mt-1">{errors.customer_id}</p>}
          </div>

          <div>
            <Label htmlFor="invoice_id">Link to Invoice (Optional)</Label>
            <Select value={formData.invoice_id} onValueChange={handleInvoiceSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select invoice (optional)" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="">No Invoice</SelectItem>
                {filteredInvoices.map(invoice => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{invoice.invoice_number}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          (invoice as any).payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          (invoice as any).payment_status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {(invoice as any).payment_status || 'unpaid'}
                        </Badge>
                        <span className="text-sm">₹{invoice.total_amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedInvoice && (
            <div className="p-4 bg-blue-50 rounded-lg border">
              <h4 className="font-medium text-blue-900 mb-2">Invoice Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Amount:</span>
                  <span className="ml-2 font-medium">₹{selectedInvoice.total_amount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-blue-700">Paid Amount:</span>
                  <span className="ml-2 font-medium">₹{((selectedInvoice as any).paid_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-blue-700">Outstanding:</span>
                  <span className="ml-2 font-medium text-red-600">
                    ₹{(selectedInvoice.total_amount - ((selectedInvoice as any).paid_amount || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Status:</span>
                  <Badge className="ml-2">
                    {(selectedInvoice as any).payment_status || 'unpaid'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_reference">Payment Reference</Label>
              <Input
                id="payment_reference"
                value={formData.payment_reference}
                onChange={(e) => handleInputChange('payment_reference', e.target.value)}
                placeholder="PAY-001"
              />
            </div>

            <div>
              <Label htmlFor="receipt_number">Receipt Number</Label>
              <Input
                id="receipt_number"
                value={formData.receipt_number}
                onChange={(e) => handleInputChange('receipt_number', e.target.value)}
                placeholder="Receipt number"
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => handleInputChange('payment_date', e.target.value)}
                className={errors.payment_date ? 'border-red-500' : ''}
              />
              {errors.payment_date && <p className="text-sm text-red-500 mt-1">{errors.payment_date}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="payment_method">Payment Method *</Label>
            <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
              <SelectTrigger className={errors.payment_method ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {paymentMethodOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_method && <p className="text-sm text-red-500 mt-1">{errors.payment_method}</p>}
          </div>

          {formData.payment_method !== 'cash' && (
            <div>
              <Label htmlFor="transaction_id">
                Transaction ID / Reference Number *
                {formData.payment_method === 'cheque' && ' (Cheque Number)'}
                {formData.payment_method === 'upi' && ' (UPI Reference)'}
              </Label>
              <Input
                id="transaction_id"
                value={formData.transaction_id}
                onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                placeholder={
                  formData.payment_method === 'cheque' ? 'Cheque number' :
                  formData.payment_method === 'upi' ? 'UPI transaction ID' :
                  'Transaction ID / Reference'
                }
                className={errors.transaction_id ? 'border-red-500' : ''}
              />
              {errors.transaction_id && <p className="text-sm text-red-500 mt-1">{errors.transaction_id}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about this payment"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Recording...
            </>
          ) : (
            <>
              <Receipt className="h-4 w-4 mr-2" />
              Record Payment
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
