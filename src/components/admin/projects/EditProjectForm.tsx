'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Save, ArrowLeft, Users, DollarSign, Calendar, FileText } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface Employee {
  id: string
  full_name: string
}

interface Project {
  id: string
  project_name: string
  project_number: string
  description?: string
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
// Enhanced fields for Phase 1
  estimated_value: number
  project_type: 'installation' | 'maintenance' | 'repair' | 'amc' | 'consultation' | 'other'
  project_address: string
  city?: string
  state?: string
  postal_code?: string
  start_date?: string
  end_date?: string
  estimated_completion?: string
  customer_id?: string
  project_manager_id?: string
  notes?: string
  customers?: Customer
  project_manager?: Employee
}

interface EditProjectFormProps {
  project: Project
  customers: Customer[]
  employees: Employee[]
}

export default function EditProjectForm({ project, customers, employees }: EditProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    project_name: project.project_name || '',
    description: project.description || '',
    customer_id: project.customer_id || '',
    project_manager_id: project.project_manager_id || '',
    start_date: project.start_date ? project.start_date.split('T')[0] : '',
    end_date: project.end_date ? project.end_date.split('T')[0] : '',
    estimated_completion: project.estimated_completion ? project.estimated_completion.split('T')[0] : '',
    
    // Enhanced fields
    estimated_value: project.estimated_value?.toString() || '0',
    project_type: project.project_type || 'installation',
    project_address: project.project_address || '',
    city: project.city || '',
    state: project.state || '',
    postal_code: project.postal_code || '',
    
    // Keep budget for backward compatibility
    budget: project.budget?.toString() || project.estimated_value?.toString() || '0',
    priority: project.priority,
    status: project.status,
    notes: project.notes || ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData = {
        ...formData,
        budget: parseFloat(formData.budget) || 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        estimated_completion: formData.estimated_completion || null,
        customer_id: formData.customer_id || null,
        project_manager_id: formData.project_manager_id || null
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id)

      if (error) {
        throw new Error(error.message)
      }

      notify.success('Project updated successfully!')
      router.push('/admin/projects')
    } catch (error: any) {
      console.error('Update project error:', error)
      notify.error('Failed to update project: ' + (error.message || 'Please try again'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          onClick={() => router.push('/admin/projects')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => handleInputChange('project_name', e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="project_number">Project Number</Label>
                <Input
                  id="project_number"
                  value={project.project_number}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignment & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assignment & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <Label htmlFor="project_manager_id">Project Manager</Label>
                <Select value={formData.project_manager_id} onValueChange={(value) => handleInputChange('project_manager_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project manager" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="estimated_completion">Estimated Completion</Label>
                <Input
                  id="estimated_completion"
                  type="date"
                  value={formData.estimated_completion}
                  onChange={(e) => handleInputChange('estimated_completion', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget">Budget (₹) *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="Enter budget amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            {loading ? 'Updating...' : 'Update Project'}
          </Button>
        </div>
      </form>
    </div>
  )
}
