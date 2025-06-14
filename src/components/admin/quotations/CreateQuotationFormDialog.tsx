'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Save, X, FileText, Calculator, DollarSign, User, Trash2 } from 'lucide-react'
import { notify } from "@/lib/toast"

interface QuotationItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface CreateQuotationFormData {
  customer_id: string
  consultation_request_id?: string
  quotation_number: string
  title: string
  description?: string
  items: QuotationItem[]
  subtotal: number
  tax_percentage: number
  tax_amount: number
  total_amount: number
  valid_until: string
  terms_conditions?: string
  notes?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface ConsultationRequest {
  id: string
  name: string
  email: string
  phone: string
  service_type: string
  message: string
}

interface CreateQuotationFormDialogProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CreateQuotationFormDialog({ onSuccess, onCancel }: CreateQuotationFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [customers, setCustomers] = useState<Customer[]>([])
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([])
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formData, setFormData] = useState<CreateQuotationFormData>({
    customer_id: '',
    consultation_request_id: '',
    quotation_number: '',
    title: '',
    description: '',
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      }
    ],
    subtotal: 0,
    tax_percentage: 18,
    tax_amount: 0,
    total_amount: 0,
    valid_until: '',
    terms_conditions: '',
    notes: ''
  })

  useEffect(() => {
    loadCustomers()
    loadConsultationRequests()
    generateQuotationNumber()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [formData.items, formData.tax_percentage])

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, address')
        .order('name')

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error loading customers:', error)
      notify.error('Failed to load customers')
    }
  }

  const loadConsultationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .select('id, name, email, phone, service_type, message')
        .eq('status', 'new')
        .order('created_at', { ascending: false })

      if (error) throw error
      setConsultationRequests(data || [])
    } catch (error) {
      console.error('Error loading consultation requests:', error)
      notify.error('Failed to load consultation requests')
    }
  }

  const generateQuotationNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const quotationNumber = `QT-${timestamp}`
    setFormData(prev => ({ ...prev, quotation_number: quotationNumber }))
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = (subtotal * formData.tax_percentage) / 100
    const totalAmount = subtotal + taxAmount

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_id) newErrors.customer_id = 'Customer is required'
    if (!formData.title.trim()) newErrors.title = 'Quotation title is required'
    if (!formData.valid_until) newErrors.valid_until = 'Valid until date is required'
    if (formData.items.length === 0) newErrors.items = 'At least one item is required'
    
    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'Item description is required'
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0'
      }
      if (item.unit_price <= 0) {
        newErrors[`item_${index}_unit_price`] = 'Unit price must be greater than 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('quotations')
        .insert([{
          ...formData,
          status: 'draft'
        }])

      if (error) throw error

      notify.success('Quotation created successfully!')
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating quotation:', error)
      notify.error(`Failed to create quotation: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateQuotationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addItem = () => {
    const newItem: QuotationItem = {
      id: (formData.items.length + 1).toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      
      // Recalculate total for this item
      if (field === 'quantity' || field === 'unit_price') {
        newItems[index].total = newItems[index].quantity * newItems[index].unit_price
      }
      
      return { ...prev, items: newItems }
    })
  }

  const defaultValidUntil = () => {
    const date = new Date()
    date.setDate(date.getDate() + 30) // 30 days from now
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">New Quotation</CardTitle>
                <p className="text-indigo-100 mt-1">Create detailed project quotation</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quotation_number" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4" />
                  Quotation Number
                </Label>
                <Input
                  id="quotation_number"
                  value={formData.quotation_number}
                  readOnly
                  className="bg-gray-100 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Quotation Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter quotation title"
                  className="bg-white/50 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>
            </div>

            {/* Customer Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer_id" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  Customer *
                </Label>
                <Select 
                  value={formData.customer_id} 
                  onValueChange={(value) => handleInputChange('customer_id', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.name}</span>
                          <span className="text-sm text-gray-500">{customer.email} • {customer.phone}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customer_id && <p className="text-red-500 text-sm">{errors.customer_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultation_request_id" className="text-sm font-medium text-gray-700">
                  Related Lead (Optional)
                </Label>
                <Select 
                  value={formData.consultation_request_id || ''} 
                  onValueChange={(value) => handleInputChange('consultation_request_id', value || null)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                    <SelectValue placeholder="Select related lead (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultationRequests.map((request) => (
                      <SelectItem key={request.id} value={request.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{request.name}</span>
                          <span className="text-sm text-gray-500">{request.service_type} • {request.phone}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Project Description
              </Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the project and requirements..."
                rows={3}
                className="bg-white/50 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 resize-none"
              />
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Quotation Items</Label>
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  size="sm"
                  className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="bg-white/30 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-5">
                        <Label className="text-xs text-gray-600">Description *</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          className="bg-white/70 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                        />
                        {errors[`item_${index}_description`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_description`]}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-xs text-gray-600">Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="bg-white/70 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-xs text-gray-600">Unit Price *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="bg-white/70 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                        />
                        {errors[`item_${index}_unit_price`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_unit_price`]}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-xs text-gray-600">Total</Label>
                        <Input
                          value={`₹${item.total.toFixed(2)}`}
                          readOnly
                          className="bg-gray-100 border-gray-200"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <Button
                          type="button"
                          onClick={() => removeItem(index)}
                          variant="outline"
                          size="sm"
                          disabled={formData.items.length === 1}
                          className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tax_percentage" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calculator className="h-4 w-4" />
                    Tax Percentage
                  </Label>
                  <Input
                    id="tax_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.tax_percentage}
                    onChange={(e) => handleInputChange('tax_percentage', parseFloat(e.target.value) || 0)}
                    className="bg-white/70 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_until" className="text-sm font-medium text-gray-700">
                    Valid Until *
                  </Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until || defaultValidUntil()}
                    onChange={(e) => handleInputChange('valid_until', e.target.value)}
                    className="bg-white/70 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                  {errors.valid_until && <p className="text-red-500 text-sm">{errors.valid_until}</p>}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{formData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax ({formData.tax_percentage}%):</span>
                    <span className="font-medium">₹{formData.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-indigo-600">₹{formData.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="terms_conditions" className="text-sm font-medium text-gray-700">
                  Terms & Conditions
                </Label>
                <Textarea
                  id="terms_conditions"
                  value={formData.terms_conditions || ''}
                  onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
                  placeholder="Enter terms and conditions..."
                  rows={4}
                  className="bg-white/50 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Internal Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Internal notes (not visible to customer)..."
                  rows={4}
                  className="bg-white/50 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 resize-none"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Create Quotation
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}