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
import { notify } from '@/lib/toast'
import { Employee, Customer, Project } from '@/lib/enhanced-types'

interface ConsultationRequest {
  id: string
  name: string
  email: string
  phone: string
  service_type: string
  message: string
}

interface QuotationItemTemp {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface CreateQuotationFormProps {
  employee: Employee
  customers: Customer[]
  projects: Project[]
  consultationRequests: ConsultationRequest[]
}

export default function CreateQuotationForm({ 
  employee, 
  customers,
  projects,
  consultationRequests 
}: CreateQuotationFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [loading, setLoading] = useState(false)
  const [customerType, setCustomerType] = useState<'existing' | 'consultation' | 'new'>('consultation')
  
  const [formData, setFormData] = useState({
    customer_id: '',
    project_id: '',
    consultation_request_id: '',
    quote_number: `QUO-${Date.now()}`,
    quote_title: '',
    description: '',
    valid_until: '',
    terms_and_conditions: `1. All prices are in Indian Rupees (INR)
2. Installation will be completed within 7-10 working days from confirmation
3. 1 year comprehensive warranty on all equipment
4. Payment terms: 50% advance, 50% on completion
5. GST will be added as applicable
6. This quotation is valid for 30 days from the date of issue`,
    notes: '',
    tax_rate: 18,
    discount_percentage: 0
  })

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  const [items, setItems] = useState<QuotationItemTemp[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }
  ])

  // Pre-fill form when consultation request is selected
  const handleConsultationSelect = (consultationId: string) => {
    const consultation = (consultationRequests || []).find(c => c.id === consultationId)
    if (consultation) {
      setFormData(prev => ({
        ...prev,
        consultation_request_id: consultationId,
        title: `${consultation.service_type} Quotation for ${consultation.name}`,
        description: consultation.message || ''
      }))
      
      // Pre-fill new customer data
      setNewCustomer({
        name: consultation.name,
        email: consultation.email,
        phone: consultation.phone,
        address: ''
      })
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
  const updateItem = (id: string, field: keyof QuotationItemTemp, value: string | number) => {
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
      let customer_id = formData.customer_id

      // Create new customer if needed
      if (customerType === 'new' || (customerType === 'consultation' && !formData.customer_id)) {
        const { data: newCustomerData, error: customerError } = await supabase
          .from('customers')
          .insert([newCustomer])
          .select()
          .single()

        if (customerError) throw customerError
        customer_id = newCustomerData.id
      }

      // Create quotation
      const quotationData = {
        ...formData,
        customer_id,
        consultation_request_id: customerType === 'consultation' ? formData.consultation_request_id : null,
        status,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        created_by: employee.id
      }

      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert([quotationData])
        .select()
        .single()

      if (quotationError) throw quotationError

      // Create quotation items
      const quotationItems = items.map(item => ({
        quotation_id: quotation.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.total
      }))

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(quotationItems)

      if (itemsError) throw itemsError

      // Show success message and redirect
      notify.success(
        'Quotation created successfully!',
        status === 'sent' ? 'Quotation has been created and sent to customer.' : 'Quotation saved as draft.'
      )
      
      router.push('/admin/quotations')
    } catch (error) {
      console.error('Error creating quotation:', error)
      notify.error(
        'Failed to create quotation',
        'There was an error creating the quotation. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Customer Selection */}
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label>Customer Type</Label>
            <Select value={customerType} onValueChange={(value: string) => setCustomerType(value as 'existing' | 'consultation' | 'new')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="consultation">From Consultation Request</SelectItem>
                <SelectItem value="existing">Existing Customer</SelectItem>
                <SelectItem value="new">New Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {customerType === 'consultation' && (
            <div>
              <Label>Consultation Request</Label>
              <Select value={formData.consultation_request_id} onValueChange={handleConsultationSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select consultation request" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {(consultationRequests || []).map(request => (
                    <SelectItem key={request.id} value={request.id}>
                      {request.name} - {request.service_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {customerType === 'existing' && (
            <>
              <div>
                <Label>Customer</Label>
                <Select value={formData.customer_id} onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {(customers || []).map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Link to Project (Optional)</Label>
                <Select value={formData.project_id} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project (optional)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="">No Project</SelectItem>
                    {(projects || [])
                      .filter(p => p.customer_id === formData.customer_id)
                      .map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.project_number} - {project.project_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {(customerType === 'new' || customerType === 'consultation') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotation Details */}
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold">Quotation Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Quotation Number</Label>
              <Input
                value={formData.quote_number}
                onChange={(e) => setFormData(prev => ({ ...prev, quote_number: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label>Title</Label>
            <Input
              value={formData.quote_title}
              onChange={(e) => setFormData(prev => ({ ...prev, quote_title: e.target.value }))}
              placeholder="e.g., AC Installation and Maintenance Quote"
              required
            />
          </div>
          
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the work to be done"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Items & Services</CardTitle>
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

      {/* Totals & Terms */}
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

        {/* Terms & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Terms & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Terms & Conditions</Label>
              <Textarea
                value={formData.terms_and_conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, terms_and_conditions: e.target.value }))}
                rows={8}
                className="text-sm"
              />
            </div>
            
            <div>
              <Label>Internal Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Internal notes (not visible to customer)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push('/admin/quotations')}>
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
