'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Minus, Save, Send } from 'lucide-react'
import { Project, Quotation, Customer, Employee, InvoiceItem } from '@/lib/enhanced-types'
import { notify } from '@/lib/toast'

interface CreateInvoiceFormProps {
  employee: Employee
  projects: Project[]
  customers: Customer[]
  quotations: Quotation[]
}

interface InvoiceItemTemp {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export default function CreateInvoiceForm({ 
  employee, 
  projects, 
  customers,
  quotations
}: CreateInvoiceFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [loading, setLoading] = useState(false)
  const [invoiceType, setInvoiceType] = useState<'project' | 'direct'>('project')
  
  const [formData, setFormData] = useState({
    customer_id: '',
    project_id: '',
    invoice_number: `INV-${Date.now()}`,
    invoice_type: 'progress', // 'advance', 'progress', 'final', 'amc'
    due_date: '',
    payment_terms: 'Net 30 days',
    notes: '',
    tax_rate: 18,
    discount_percentage: 0
  })

  const [items, setItems] = useState<InvoiceItemTemp[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }
  ])

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setFormData(prev => ({
        ...prev,
        project_id: projectId,
        customer_id: project.customer_id || ''
      }))
      
      // Pre-fill items based on project quotations
      const projectQuotations = quotations.filter(q => q.project_id === projectId)
      if (projectQuotations.length > 0) {
        const quotation = projectQuotations[0]
        setItems([{
          id: '1',
          description: `${project.project_name} - Progress Payment`,
          quantity: 1,
          unit_price: quotation.total_amount * 0.5, // 50% progress payment
          total: quotation.total_amount * 0.5
        }])
      }
    }
  }

  // Add new item
  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }])
  }

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  // Update item
  const updateItem = (id: string, field: keyof InvoiceItemTemp, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unit_price') {
          updated.total = updated.quantity * updated.unit_price
        }
        return updated
      }
      return item
    }))
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = (subtotal * formData.discount_percentage) / 100
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * formData.tax_rate) / 100
  const totalAmount = taxableAmount + taxAmount

  // Handle form submission
  const handleSubmit = async (status: 'draft' | 'sent') => {
    setLoading(true)
    try {
      // Create invoice with enhanced fields
      const invoiceData = {
        ...formData,
        status,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        balance_due: totalAmount,
        amount_paid: 0,
        created_by: employee.id,
        issue_date: new Date().toISOString().split('T')[0],
        invoice_date: new Date().toISOString().split('T')[0],
        // Enhanced fields
        invoice_type: invoiceType === 'project' ? 'invoice' : 'invoice',
        tax_rate: formData.tax_rate
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create invoice items with enhanced fields
      const invoiceItems = items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.total,
        unit: 'piece' // Default unit
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)

      if (itemsError) throw itemsError

      // Log project activity if linked to project
      if (formData.project_id) {
        try {
          await supabase
            .from('project_activities')
            .insert([{
              project_id: formData.project_id,
              activity_type: 'invoice_created',
              title: `Invoice ${invoice.invoice_number} created`,
              description: `Invoice for ₹${totalAmount.toLocaleString('en-IN')} has been ${status}`,
              entity_type: 'invoice',
              entity_id: invoice.id,
              performed_by: employee.id
            }])
        } catch (activityError) {
          console.error('Error logging project activity:', activityError)
          // Don't throw - invoice creation succeeded
        }
      }

      notify.success(
        'Invoice created successfully!',
        status === 'sent' ? 'Invoice has been created and sent.' : 'Invoice saved as draft.'
      )

      router.push('/admin/invoicing')
    } catch (error) {
      console.error('Error creating invoice:', error)
      notify.error(
        'Failed to create invoice',
        'There was an error creating the invoice. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Set default due date (30 days from today)
  useState(() => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    setFormData(prev => ({
      ...prev,
      due_date: dueDate.toISOString().split('T')[0]
    }))
  })

  return (
    <div className="space-y-8">
      {/* Invoice Type & Customer Selection */}
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold">Invoice Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label>Invoice Type</Label>
            <Select value={invoiceType} onValueChange={(value: string) => setInvoiceType(value as 'project' | 'direct')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="project">Project Invoice</SelectItem>
                <SelectItem value="direct">Direct Invoice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {invoiceType === 'project' && (
            <div>
              <Label>Project</Label>
              <Select value={formData.project_id} onValueChange={handleProjectSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_number} - {project.project_name} ({project.customers?.name || 'No Customer'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {invoiceType === 'direct' && (
            <div>
              <Label>Customer</Label>
              <Select value={formData.customer_id} onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}>
                <SelectTrigger>
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
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Invoice Number</Label>
              <Input
                value={formData.invoice_number}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Invoice Type</Label>
              <Select value={formData.invoice_type} onValueChange={(value) => setFormData(prev => ({ ...prev, invoice_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="advance">Advance Payment</SelectItem>
                  <SelectItem value="progress">Progress Payment</SelectItem>
                  <SelectItem value="final">Final Payment</SelectItem>
                  <SelectItem value="amc">AMC Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Terms</Label>
              <Input
                value={formData.payment_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Invoice Items</CardTitle>
            <Button onClick={addItem} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
          {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Unit Price (₹)</Label>
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label>Total (₹)</Label>
                    <Input
                      value={item.total.toLocaleString('en-IN')}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculation */}
        <Card>
          <CardHeader>
            <CardTitle>Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div>
                <Label>Tax/GST (%)</Label>
                <Input
                  type="number"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({formData.discount_percentage}%):</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax/GST ({formData.tax_rate}%):</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Internal Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Internal notes about this invoice"
                rows={8}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push('/admin/invoicing')}>
          Cancel
        </Button>
        <Button 
          onClick={() => handleSubmit('draft')}
          disabled={loading}
          variant="outline"
        >
          <Save className="h-4 w-4 mr-1" />
          Save as Draft
        </Button>
        <Button 
          onClick={() => handleSubmit('sent')}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <Send className="h-4 w-4 mr-1" />
          Create & Send
        </Button>
      </div>
    </div>
  )
}
