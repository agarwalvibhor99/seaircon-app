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
import { Save, X, FileText, Calendar, DollarSign, Clock, User } from 'lucide-react'
import { notify } from "@/lib/toast"

interface CreateAMCFormData {
  contract_name: string
  customer_id: string
  project_id?: string
  contract_type: 'basic' | 'premium' | 'comprehensive' | 'custom'
  start_date: string
  end_date: string
  annual_amount: number
  service_frequency: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly'
  response_time_hours: number
  assigned_to?: string
  notes?: string
}

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
}

interface Employee {
  id: string
  full_name: string
  role: string
}

interface CreateAMCFormDialogProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CreateAMCFormDialog({ onSuccess, onCancel }: CreateAMCFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [customers, setCustomers] = useState<Customer[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formData, setFormData] = useState<CreateAMCFormData>({
    contract_name: '',
    customer_id: '',
    project_id: '',
    contract_type: 'basic',
    start_date: '',
    end_date: '',
    annual_amount: 0,
    service_frequency: 'quarterly',
    response_time_hours: 24,
    assigned_to: '',
    notes: ''
  })

  const contractTypes = [
    { value: 'basic', label: 'Basic', description: 'Standard maintenance' },
    { value: 'premium', label: 'Premium', description: 'Enhanced service with priority support' },
    { value: 'comprehensive', label: 'Comprehensive', description: 'Full service with parts included' },
    { value: 'custom', label: 'Custom', description: 'Tailored service agreement' }
  ]

  const frequencies = [
    { value: 'monthly', label: 'Monthly', description: '12 visits per year' },
    { value: 'quarterly', label: 'Quarterly', description: '4 visits per year' },
    { value: 'half_yearly', label: 'Half Yearly', description: '2 visits per year' },
    { value: 'yearly', label: 'Yearly', description: '1 visit per year' }
  ]

  const responseHours = [
    { value: 4, label: '4 Hours', type: 'Emergency' },
    { value: 8, label: '8 Hours', type: 'Urgent' },
    { value: 24, label: '24 Hours', type: 'Standard' },
    { value: 48, label: '48 Hours', type: 'Normal' },
    { value: 72, label: '72 Hours', type: 'Scheduled' }
  ]

  useEffect(() => {
    loadCustomers()
    loadProjects()
    loadEmployees()
  }, [])

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone')
        .order('name')

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error loading customers:', error)
      notify.error('Failed to load customers')
    }
  }

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, project_name, project_number')
        .in('status', ['completed', 'active'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
      notify.error('Failed to load projects')
    }
  }

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, role')
        .in('role', ['technician', 'service_engineer', 'supervisor'])
        .eq('status', 'active')
        .order('full_name')

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error loading employees:', error)
      notify.error('Failed to load employees')
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.contract_name.trim()) newErrors.contract_name = 'Contract name is required'
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required'
    if (!formData.start_date) newErrors.start_date = 'Start date is required'
    if (!formData.end_date) newErrors.end_date = 'End date is required'
    if (formData.annual_amount <= 0) newErrors.annual_amount = 'Annual amount must be greater than 0'

    // Validate dates
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Generate contract number
      const contractNumber = `SEA-AMC-${Date.now().toString().slice(-6)}`
      
      const contractData = {
        contract_number: contractNumber,
        ...formData,
        status: 'active'
      }

      const { error } = await supabase
        .from('amc_contracts')
        .insert([contractData])

      if (error) throw error

      notify.success('AMC contract created successfully!')
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating AMC contract:', error)
      notify.error(`Failed to create contract: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateAMCFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Create AMC Contract</CardTitle>
                <p className="text-purple-100 mt-1">Setup annual maintenance contract</p>
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
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contract_name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4" />
                  Contract Name *
                </Label>
                <Input
                  id="contract_name"
                  value={formData.contract_name}
                  onChange={(e) => handleInputChange('contract_name', e.target.value)}
                  placeholder="Enter contract name"
                  className="bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                />
                {errors.contract_name && <p className="text-red-500 text-sm">{errors.contract_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_id" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  Customer *
                </Label>
                <Select 
                  value={formData.customer_id} 
                  onValueChange={(value) => handleInputChange('customer_id', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200">
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
            </div>

            {/* Contract Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contract_type" className="text-sm font-medium text-gray-700">
                  Contract Type
                </Label>
                <Select 
                  value={formData.contract_type} 
                  onValueChange={(value: any) => handleInputChange('contract_type', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.label}</span>
                          <span className="text-sm text-gray-500">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_id" className="text-sm font-medium text-gray-700">
                  Related Project (Optional)
                </Label>
                <Select 
                  value={formData.project_id || ''} 
                  onValueChange={(value) => handleInputChange('project_id', value || null)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200">
                    <SelectValue placeholder="Select project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{project.project_name}</span>
                          <span className="text-sm text-gray-500">{project.project_number}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Start Date *
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                />
                {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  End Date *
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                />
                {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="annual_amount" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="h-4 w-4" />
                  Annual Amount *
                </Label>
                <Input
                  id="annual_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.annual_amount}
                  onChange={(e) => handleInputChange('annual_amount', parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount"
                  className="bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                />
                {errors.annual_amount && <p className="text-red-500 text-sm">{errors.annual_amount}</p>}
              </div>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="service_frequency" className="text-sm font-medium text-gray-700">
                  Service Frequency
                </Label>
                <Select 
                  value={formData.service_frequency} 
                  onValueChange={(value: any) => handleInputChange('service_frequency', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{freq.label}</span>
                          <span className="text-sm text-gray-500">{freq.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response_time_hours" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="h-4 w-4" />
                  Response Time
                </Label>
                <Select 
                  value={formData.response_time_hours.toString()} 
                  onValueChange={(value) => handleInputChange('response_time_hours', parseInt(value))}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {responseHours.map((time) => (
                      <SelectItem key={time.value} value={time.value.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{time.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {time.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignment */}
            <div className="space-y-2">
              <Label htmlFor="assigned_to" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                Assigned Engineer (Optional)
              </Label>
              <Select 
                value={formData.assigned_to || ''} 
                onValueChange={(value) => handleInputChange('assigned_to', value || null)}
              >
                <SelectTrigger className="bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200">
                  <SelectValue placeholder="Select assigned engineer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <span>{employee.full_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {employee.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Contract Notes & Terms
              </Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add contract terms, special conditions, or additional notes..."
                rows={4}
                className="bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200 resize-none"
              />
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
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Create AMC Contract
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
