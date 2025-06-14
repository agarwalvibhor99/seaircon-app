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
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Save, Send, FileText, Calculator, DollarSign, User, Building, Calendar, AlertCircle } from 'lucide-react'
import { Project, Quotation, Customer, Employee, InvoiceItem } from '@/lib/enhanced-types'
import { notify } from "@/lib/toast"

interface InvoiceItemTemp {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface CreateInvoiceFormDialogProps {
  employee: Employee
  projects: Project[]
  customers: Customer[]
  quotations: Quotation[]
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CreateInvoiceFormDialog({ 
  employee, 
  projects, 
  customers,
  quotations,
  onSuccess,
  onCancel
}: CreateInvoiceFormDialogProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [invoiceType, setInvoiceType] = useState<'project' | 'direct'>('project')
  
  const [formData, setFormData] = useState({
    customer_id: '',
    project_id: '',
    invoice_number: `INV-${Date.now()}`,
    invoice_type: 'progress', // 'advance', 'progress', 'final', 'amc'
    due_date: '',
    description: '',
    notes: '',
    tax_rate: 18,
    discount_percentage: 0,
    payment_terms: '30 days',
    payment_method: 'bank_transfer'
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required'
    }

    if (invoiceType === 'project' && !formData.project_id) {
      newErrors.project_id = 'Project is required for project-based invoices'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    // Validate items
    const validItems = items.filter(item => item.description.trim() && item.quantity > 0 && item.unit_price > 0)
    if (validItems.length === 0) {
      newErrors.items = 'At least one valid item is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Pre-fill form when project is selected
  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setFormData(prev => ({
        ...prev,
        project_id: projectId,
        customer_id: project.customer_id,
        description: `Invoice for ${project.project_name}`
      }))
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
    if (!validateForm()) {
      notify.error('Please fix the errors and try again')
      return
    }

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
        created_by: employee.id
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create invoice items
      const invoiceItems = items
        .filter(item => item.description.trim() && item.quantity > 0 && item.unit_price > 0)
        .map(item => ({
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

      // Show success message
      notify.success(
        'Invoice created successfully!',
        status === 'sent' ? 'Invoice has been created and sent to customer.' : 'Invoice saved as draft.'
      )
      
      onSuccess?.()
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

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const invoiceTypeOptions = [
    { value: 'advance', label: 'Advance Payment', color: 'bg-blue-100 text-blue-800' },
    { value: 'progress', label: 'Progress Payment', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'final', label: 'Final Payment', color: 'bg-green-100 text-green-800' },
    { value: 'amc', label: 'AMC Invoice', color: 'bg-purple-100 text-purple-800' }
  ]

  const paymentMethodOptions = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Card Payment' }
  ]

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* Invoice Type Selection */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Type
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Invoice Source</Label>
            <Select value={invoiceType} onValueChange={(value: string) => setInvoiceType(value as 'project' | 'direct')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="project">Project-based Invoice</SelectItem>
                <SelectItem value="direct">Direct Customer Invoice</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer & Project Information */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer & Project Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {invoiceType === 'project' && (
            <div>
              <Label htmlFor="project_id">Project *</Label>
              <Select value={formData.project_id} onValueChange={handleProjectSelect}>
                <SelectTrigger className={errors.project_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_number} - {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.project_id && <p className="text-sm text-red-500 mt-1">{errors.project_id}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="customer_id">Customer *</Label>
            <Select 
              value={formData.customer_id} 
              onValueChange={(value) => handleInputChange('customer_id', value)}
            >
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
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                placeholder="INV-001"
              />
            </div>

            <div>
              <Label htmlFor="invoice_type">Invoice Type</Label>
              <Select value={formData.invoice_type} onValueChange={(value) => handleInputChange('invoice_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice type" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {invoiceTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={option.color}>{option.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className={errors.due_date ? 'border-red-500' : ''}
              />
              {errors.due_date && <p className="text-sm text-red-500 mt-1">{errors.due_date}</p>}
            </div>

            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Select value={formData.payment_terms} onValueChange={(value) => handleInputChange('payment_terms', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="15 days">15 Days</SelectItem>
                  <SelectItem value="30 days">30 Days</SelectItem>
                  <SelectItem value="45 days">45 Days</SelectItem>
                  <SelectItem value="60 days">60 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Invoice description"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Invoice Items
            </CardTitle>
            <Button onClick={addItem} variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-gray-50/50">
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
                      className="bg-gray-100"
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
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
          {errors.items && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
              <AlertCircle className="h-4 w-4" />
              {errors.items}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculation & Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculation */}
        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) => handleInputChange('discount_percentage', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="tax_rate">Tax/GST (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  value={formData.tax_rate}
                  onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
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

        {/* Payment & Notes */}
        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building className="h-5 w-5" />
              Payment & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="payment_method">Preferred Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {paymentMethodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Internal notes (not visible to customer)"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="button"
          onClick={() => handleSubmit('draft')}
          disabled={loading}
          variant="outline"
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button 
          type="button"
          onClick={() => handleSubmit('sent')}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Create & Send
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
