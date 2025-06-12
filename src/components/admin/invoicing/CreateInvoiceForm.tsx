'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Minus, Save, Send } from 'lucide-react'

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

interface Project {
  id: string
  project_name: string
  project_number: string
  project_value: number
  status: string
  customers: Customer
  quotations: Array<{
    id: string
    quotation_number: string
    total_amount: number
  }>
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface CreateInvoiceFormProps {
  employee: Employee
  projects: Project[]
  customers: Customer[]
}

export default function CreateInvoiceForm({ 
  employee, 
  projects, 
  customers 
}: CreateInvoiceFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
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

  const [items, setItems] = useState<InvoiceItem[]>([
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
        customer_id: project.customers.id
      }))
      
      // Pre-fill items based on project
      if (project.quotations.length > 0) {
        const quotation = project.quotations[0]
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
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
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
      // Create invoice
      const invoiceData = {
        ...formData,
        status,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        balance_due: totalAmount,
        created_by: employee.id,
        invoice_date: new Date().toISOString().split('T')[0]
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create invoice items
      const invoiceItems = items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.total
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)

      if (itemsError) throw itemsError

      router.push('/admin/invoicing')
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Error creating invoice. Please try again.')
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
    <div className="space-y-6">
      {/* Invoice Type & Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Invoice Type</Label>
            <Select value={invoiceType} onValueChange={(value: string) => setInvoiceType(value as 'project' | 'direct')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_number} - {project.project_name} ({project.customers.name})
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
                <SelectContent>
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
                <SelectContent>
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <Button onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
