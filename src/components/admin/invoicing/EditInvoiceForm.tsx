'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Save, ArrowLeft, FileText, DollarSign, Calendar } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface Project {
  id: string
  project_name: string
  project_number: string
  customers: Customer
}

interface Invoice {
  id: string
  invoice_number: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  total_amount: number
  subtotal?: number
  tax_amount?: number
  discount_amount?: number
  due_date: string
  issue_date: string
  payment_terms?: string
  notes?: string
  tax_rate?: number
  discount_percentage?: number
  project_id?: string
  customer_id?: string
  projects?: Project
  customers?: Customer
}

interface EditInvoiceFormProps {
  invoice: Invoice
  projects: Project[]
  customers: Customer[]
}

export default function EditInvoiceForm({ invoice, projects, customers }: EditInvoiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: invoice.customer_id || '',
    project_id: invoice.project_id || '',
    status: invoice.status,
    due_date: invoice.due_date.split('T')[0],
    issue_date: invoice.issue_date.split('T')[0],
    payment_terms: invoice.payment_terms || 'Net 30 days',
    notes: invoice.notes || '',
    tax_rate: invoice.tax_rate || 18,
    discount_percentage: invoice.discount_percentage || 0,
    subtotal: invoice.subtotal || invoice.total_amount,
    tax_amount: invoice.tax_amount || 0,
    discount_amount: invoice.discount_amount || 0,
    total_amount: invoice.total_amount
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Recalculate totals when relevant fields change
      if (field === 'subtotal' || field === 'tax_rate' || field === 'discount_percentage') {
        const subtotal = Number(updated.subtotal)
        const discountAmount = (subtotal * Number(updated.discount_percentage)) / 100
        const taxableAmount = subtotal - discountAmount
        const taxAmount = (taxableAmount * Number(updated.tax_rate)) / 100
        const totalAmount = taxableAmount + taxAmount
        
        updated.discount_amount = discountAmount
        updated.tax_amount = taxAmount
        updated.total_amount = totalAmount
      }
      
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData = {
        ...formData,
        customer_id: formData.customer_id || null,
        project_id: formData.project_id || null,
        due_date: formData.due_date,
        issue_date: formData.issue_date,
        payment_terms: formData.payment_terms,
        notes: formData.notes,
        tax_rate: Number(formData.tax_rate),
        discount_percentage: Number(formData.discount_percentage),
        subtotal: Number(formData.subtotal),
        tax_amount: Number(formData.tax_amount),
        discount_amount: Number(formData.discount_amount),
        total_amount: Number(formData.total_amount)
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoice.id)

      if (error) {
        throw new Error(error.message)
      }

      notify.success('Invoice updated successfully!')
      router.push('/admin/invoicing')
    } catch (error: any) {
      console.error('Update invoice error:', error)
      notify.error('Failed to update invoice: ' + (error.message || 'Please try again'))
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          onClick={() => router.push('/admin/invoicing')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input
                  id="invoice_number"
                  value={invoice.invoice_number}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => handleInputChange('issue_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project & Customer */}
        <Card>
          <CardHeader>
            <CardTitle>Project & Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_id">Project</Label>
                <Select value={formData.project_id} onValueChange={(value) => handleInputChange('project_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project (optional)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_name} ({project.project_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customer_id">Customer</Label>
                <Select value={formData.customer_id} onValueChange={(value) => handleInputChange('customer_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subtotal">Subtotal (₹)</Label>
                <Input
                  id="subtotal"
                  type="number"
                  value={formData.subtotal}
                  onChange={(e) => handleInputChange('subtotal', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="discount_percentage">Discount (%)</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) => handleInputChange('discount_percentage', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  value={formData.tax_rate}
                  onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Discount Amount</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  {formatCurrency(formData.discount_amount)}
                </div>
              </div>

              <div>
                <Label>Tax Amount</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  {formatCurrency(formData.tax_amount)}
                </div>
              </div>

              <div>
                <Label>Total Amount</Label>
                <div className="p-2 bg-blue-50 rounded border font-semibold text-blue-700">
                  {formatCurrency(formData.total_amount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Terms & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Select value={formData.payment_terms} onValueChange={(value) => handleInputChange('payment_terms', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                  <SelectItem value="Net 15 days">Net 15 days</SelectItem>
                  <SelectItem value="Net 30 days">Net 30 days</SelectItem>
                  <SelectItem value="Net 45 days">Net 45 days</SelectItem>
                  <SelectItem value="Net 60 days">Net 60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Updating...' : 'Update Invoice'}
          </Button>
        </div>
      </form>
    </div>
  )
}
