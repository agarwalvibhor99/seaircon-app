'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Save, ArrowLeft, FileText, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react'
import { showToast } from '@/lib/toast.service'
import { WorkflowValidationService } from '@/lib/workflow-validation.service'

interface Employee {
  id: string
  full_name: string
  role: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface Quotation {
  id: string
  quotation_number: string
  client_name: string
  total_amount: number
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  customer_id: string
  created_at: string
  valid_until: string
}

interface CreateProjectFormProps {
  employee: Employee
  customers: Customer[]
  quotations: Quotation[]
  employees: Employee[]
}

export default function CreateProjectForm({ 
  employee, 
  customers, 
  quotations, 
  employees 
}: CreateProjectFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [sourceType, setSourceType] = useState<'quotation' | 'direct'>('quotation')
  const [workflowWarnings, setWorkflowWarnings] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Check if there's a pre-selected quotation from URL
  const preSelectedQuotationId = searchParams.get('quotation_id')
  
  // Filter only approved quotations for project creation
  const approvedQuotations = quotations.filter(q => q.status === 'approved')
  
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    customer_id: '',
    quotation_id: '',
    project_manager_id: employee.id,
    start_date: '',
    estimated_completion: '',
    budget: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'planning' as 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled',
    notes: ''
  })

  const handleQuotationSelect = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId)
    if (quotation) {
      setFormData(prev => ({
        ...prev,
        quotation_id: quotationId,
        project_name: `${quotation.client_name} - Project`,
        budget: quotation.total_amount.toString(),
        description: `Project created from quotation ${quotation.quotation_number}`
      }))
    }
  }
  
  // Check for workflow violations and validate business rules
  useEffect(() => {
    const warnings: string[] = []
    
    if (sourceType === 'direct') {
      warnings.push('Creating projects without approved quotations requires manager approval')
    }
    
    if (approvedQuotations.length === 0 && sourceType === 'quotation') {
      warnings.push('No approved quotations available. Consider creating a quotation first.')
    }
    
    setWorkflowWarnings(warnings)
  }, [sourceType, approvedQuotations.length])

  // Pre-select quotation if provided in URL
  useEffect(() => {
    if (preSelectedQuotationId && approvedQuotations.some(q => q.id === preSelectedQuotationId)) {
      handleQuotationSelect(preSelectedQuotationId)
    }
  }, [preSelectedQuotationId, approvedQuotations])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check for validation errors before submitting
    if (validationErrors.length > 0) {
      showToast.error(
        'Please fix validation errors',
        'Cannot create project while there are validation errors.'
      )
      return
    }
    
    setLoading(true)

    try {
      const projectData = {
        ...formData,
        budget: parseFloat(formData.budget) || 0,
        quotation_id: sourceType === 'quotation' ? formData.quotation_id : null
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project')
      }

      showToast.success(
        'Project created successfully!',
        'The project has been created and assigned to the team.'
      )

      router.push('/admin/projects')
    } catch (error: any) {
      console.error('Create project error:', error)
      showToast.error(
        'Failed to create project',
        error.message || 'Please try again or contact support.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      {/* Workflow Warnings */}
      {workflowWarnings.length > 0 && (
        <div className="space-y-2">
          {workflowWarnings.map((warning, index) => (
            <div key={index} className="relative w-full rounded-lg border border-yellow-500/50 text-yellow-900 bg-yellow-50 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">{warning}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="space-y-2">
          {validationErrors.map((error, index) => (
            <div key={index} className="relative w-full rounded-lg border border-red-500/50 text-red-900 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workflow Status Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Customer Journey Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">Lead</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">Quotation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${sourceType === 'quotation' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium">Project</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-sm font-medium">Invoice</span>
              </div>
            </div>
            <Badge variant={sourceType === 'quotation' ? 'default' : 'secondary'}>
              {sourceType === 'quotation' ? 'Standard Workflow' : 'Direct Entry'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Source */}
        <Card>
          <CardHeader>
            <CardTitle>Project Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Create Project From</Label>
              <Select 
                value={sourceType} 
                onValueChange={(value) => setSourceType(value as 'quotation' | 'direct')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quotation">Approved Quotation</SelectItem>
                  <SelectItem value="direct">Direct Customer Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sourceType === 'quotation' && (
              <div>
                <Label>Select Quotation</Label>
                <Select 
                  value={formData.quotation_id} 
                  onValueChange={handleQuotationSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an approved quotation" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedQuotations.map((quotation) => (
                      <SelectItem key={quotation.id} value={quotation.id}>
                        {quotation.quotation_number} - {quotation.client_name} (₹{quotation.total_amount.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {sourceType === 'direct' && (
              <div>
                <Label>Select Customer</Label>
                <Select 
                  value={formData.customer_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="budget">Budget (₹) *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label>Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="estimated_completion">Estimated Completion</Label>
                <Input
                  id="estimated_completion"
                  type="date"
                  value={formData.estimated_completion}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_completion: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project scope and requirements"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Team Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Project Manager</Label>
              <Select 
                value={formData.project_manager_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, project_manager_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes or requirements"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || validationErrors.length > 0}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
