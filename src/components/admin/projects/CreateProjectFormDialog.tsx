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
import { Save, X, Building, User, Calendar, DollarSign, FileText, Zap } from 'lucide-react'
import { notify } from "@/lib/toast"

interface CreateProjectFormData {
  project_name: string
  project_number: string
  customer_id: string
  quotation_id?: string
  project_manager_id: string
  supervisor_id?: string
  description?: string
  project_type: 'installation' | 'maintenance' | 'repair' | 'consultation' | 'amc'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimated_start_date: string
  estimated_end_date: string
  project_value: number
  advance_amount?: number
  site_address: string
  requirements?: string
  notes?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Quotation {
  id: string
  quotation_number: string
  title: string
  total_amount: number
  status: string
}

interface Employee {
  id: string
  full_name: string
  role: string
}

interface CreateProjectFormDialogProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CreateProjectFormDialog({ onSuccess, onCancel }: CreateProjectFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [customers, setCustomers] = useState<Customer[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formData, setFormData] = useState<CreateProjectFormData>({
    project_name: '',
    project_number: '',
    customer_id: '',
    quotation_id: '',
    project_manager_id: '',
    supervisor_id: '',
    description: '',
    project_type: 'installation',
    priority: 'medium',
    estimated_start_date: '',
    estimated_end_date: '',
    project_value: 0,
    advance_amount: 0,
    site_address: '',
    requirements: '',
    notes: ''
  })

  const projectTypes = [
    { value: 'installation', label: 'Installation', color: 'bg-blue-100 text-blue-800' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-green-100 text-green-800' },
    { value: 'repair', label: 'Repair', color: 'bg-red-100 text-red-800' },
    { value: 'consultation', label: 'Consultation', color: 'bg-purple-100 text-purple-800' },
    { value: 'amc', label: 'AMC', color: 'bg-orange-100 text-orange-800' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    loadCustomers()
    loadQuotations()
    loadEmployees()
    generateProjectNumber()
  }, [])

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

  const loadQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('id, quotation_number, title, total_amount, status')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      if (error) throw error
      setQuotations(data || [])
    } catch (error) {
      console.error('Error loading quotations:', error)
      notify.error('Failed to load quotations')
    }
  }

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, role')
        .in('role', ['project_manager', 'supervisor', 'team_lead'])
        .eq('status', 'active')
        .order('full_name')
      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error loading employees:', error)
      notify.error('Failed to load employees')
    }
  }

  const generateProjectNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const projectNumber = `PRJ-${timestamp}`
    setFormData(prev => ({ ...prev, project_number: projectNumber }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.project_name.trim()) newErrors.project_name = 'Project name is required'
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required'
    if (!formData.project_manager_id) newErrors.project_manager_id = 'Project manager is required'
    if (!formData.estimated_start_date) newErrors.estimated_start_date = 'Estimated start date is required'
    if (!formData.estimated_end_date) newErrors.estimated_end_date = 'Estimated end date is required'
    if (!formData.site_address.trim()) newErrors.site_address = 'Site address is required'
    if (formData.project_value <= 0) newErrors.project_value = 'Project value must be greater than 0'

    // Validate dates
    if (formData.estimated_start_date && formData.estimated_end_date) {
      const startDate = new Date(formData.estimated_start_date)
      const endDate = new Date(formData.estimated_end_date)
      if (endDate <= startDate) {
        newErrors.estimated_end_date = 'End date must be after start date'
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
      // Use the API endpoint for project creation
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'planning'
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create project')
      }

      notify.success('Project created successfully!')
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating project:', error)
      notify.error(`Failed to create project: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Create Project</CardTitle>
                <p className="text-green-100 mt-1">Setup new project from approved quotation</p>
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
                <Label htmlFor="project_number" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4" />
                  Project Number
                </Label>
                <Input
                  id="project_number"
                  value={formData.project_number}
                  readOnly
                  className="bg-gray-100 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_name" className="text-sm font-medium text-gray-700">
                  Project Name *
                </Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => handleInputChange('project_name', e.target.value)}
                  placeholder="Enter project name"
                  className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200"
                />
                {errors.project_name && <p className="text-red-500 text-sm">{errors.project_name}</p>}
              </div>
            </div>

            {/* Customer and Quotation */}
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
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200">
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
                <Label htmlFor="quotation_id" className="text-sm font-medium text-gray-700">
                  Related Quotation (Optional)
                </Label>
                <Select 
                  value={formData.quotation_id || ''}
                  onValueChange={(value) => handleInputChange('quotation_id', value || null)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200">
                    <SelectValue placeholder="Select quotation (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {quotations.map((quotation) => (
                      <SelectItem key={quotation.id} value={quotation.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{quotation.quotation_number}</span>
                          <span className="text-sm text-gray-500">{quotation.title} - ₹{quotation.total_amount}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="project_type" className="text-sm font-medium text-gray-700">
                  Project Type
                </Label>
                <Select 
                  value={formData.project_type}
                  onValueChange={(value: any) => handleInputChange('project_type', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={`${type.color} text-xs`}>
                            {type.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Zap className="h-4 w-4" />
                  Priority
                </Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value: any) => handleInputChange('priority', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={`${priority.color} text-xs`}>
                            {priority.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_manager_id" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  Project Manager *
                </Label>
                <Select 
                  value={formData.project_manager_id}
                  onValueChange={(value) => handleInputChange('project_manager_id', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200">
                    <SelectValue placeholder="Select project manager" />
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
                {errors.project_manager_id && <p className="text-red-500 text-sm">{errors.project_manager_id}</p>}
              </div>
            </div>

            {/* Dates and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="estimated_start_date" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Estimated Start Date *
                </Label>
                <Input
                  id="estimated_start_date"
                  type="date"
                  value={formData.estimated_start_date}
                  onChange={(e) => handleInputChange('estimated_start_date', e.target.value)}
                  className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200"
                />
                {errors.estimated_start_date && <p className="text-red-500 text-sm">{errors.estimated_start_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_end_date" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Estimated End Date *
                </Label>
                <Input
                  id="estimated_end_date"
                  type="date"
                  value={formData.estimated_end_date}
                  onChange={(e) => handleInputChange('estimated_end_date', e.target.value)}
                  className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200"
                />
                {errors.estimated_end_date && <p className="text-red-500 text-sm">{errors.estimated_end_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_value" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="h-4 w-4" />
                  Project Value *
                </Label>
                <Input
                  id="project_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.project_value}
                  onChange={(e) => handleInputChange('project_value', parseFloat(e.target.value) || 0)}
                  placeholder="Enter project value amount"
                  className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200"
                />
                {errors.project_value && <p className="text-red-500 text-sm">{errors.project_value}</p>}
              </div>
            </div>

            {/* Site Address */}
            <div className="space-y-2">
              <Label htmlFor="site_address" className="text-sm font-medium text-gray-700">
                Project Site Address *
              </Label>
              <Input
                id="site_address"
                value={formData.site_address}
                onChange={(e) => handleInputChange('site_address', e.target.value)}
                placeholder="Enter project site address"
                className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200"
              />
              {errors.site_address && <p className="text-red-500 text-sm">{errors.site_address}</p>}
            </div>

            {/* Description and Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Project Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the project scope and objectives..."
                  rows={4}
                  className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">
                  Technical Requirements
                </Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements || ''}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="List technical requirements and specifications..."
                  rows={4}
                  className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200 resize-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Internal Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any internal notes or considerations..."
                rows={3}
                className="bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200 resize-none"
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
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Create Project
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