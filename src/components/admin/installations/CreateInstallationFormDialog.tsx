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
import { Save, X, Wrench, Calendar, User, Clock, Settings } from 'lucide-react'
import { notify } from "@/lib/toast"

interface CreateInstallationFormData {
  project_id: string
  installation_date: string
  estimated_completion: string
  technician_lead_id: string
  supervisor_id?: string
  current_phase: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  progress_percentage: number
  notes?: string
}

interface Project {
  id: string
  project_name: string
  project_number: string
  customer_name: string
}

interface Employee {
  id: string
  full_name: string
  role: string
}

interface CreateInstallationFormDialogProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CreateInstallationFormDialog({ onSuccess, onCancel }: CreateInstallationFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [projects, setProjects] = useState<Project[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formData, setFormData] = useState<CreateInstallationFormData>({
    project_id: '',
    installation_date: '',
    estimated_completion: '',
    technician_lead_id: '',
    supervisor_id: '',
    current_phase: 'planning',
    status: 'scheduled',
    progress_percentage: 0,
    notes: ''
  })

  const phases = [
    'planning',
    'site_preparation', 
    'equipment_delivery',
    'installation',
    'testing',
    'commissioning',
    'handover'
  ]

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    loadProjects()
    loadEmployees()
  }, [])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          project_name,
          project_number,
          customers(name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error

      const projectsWithCustomer = data?.map(project => ({
        id: project.id,
        project_name: project.project_name,
        project_number: project.project_number,
        customer_name: (project.customers as any)?.name || 'Unknown'
      })) || []

      setProjects(projectsWithCustomer)
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
        .in('role', ['technician', 'supervisor', 'installation_manager'])
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

    if (!formData.project_id) newErrors.project_id = 'Project is required'
    if (!formData.installation_date) newErrors.installation_date = 'Installation date is required'
    if (!formData.estimated_completion) newErrors.estimated_completion = 'Estimated completion is required'
    if (!formData.technician_lead_id) newErrors.technician_lead_id = 'Technician lead is required'
    if (!formData.current_phase) newErrors.current_phase = 'Current phase is required'

    // Validate dates
    if (formData.installation_date && formData.estimated_completion) {
      const installDate = new Date(formData.installation_date)
      const completionDate = new Date(formData.estimated_completion)
      if (completionDate <= installDate) {
        newErrors.estimated_completion = 'Completion date must be after installation date'
      }
    }

    // Validate progress percentage
    if (formData.progress_percentage < 0 || formData.progress_percentage > 100) {
      newErrors.progress_percentage = 'Progress must be between 0 and 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('installations')
        .insert([formData])

      if (error) throw error

      notify.success('Installation tracking created successfully!')
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating installation:', error)
      notify.error(`Failed to create installation: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateInstallationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Installation Tracking</CardTitle>
                <p className="text-orange-100 mt-1">Schedule and track installation progress</p>
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
            {/* Project and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="project_id" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Settings className="h-4 w-4" />
                  Project *
                </Label>
                <Select 
                  value={formData.project_id} 
                  onValueChange={(value) => handleInputChange('project_id', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{project.project_name}</span>
                          <span className="text-sm text-gray-500">{project.project_number} - {project.customer_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_id && <p className="text-red-500 text-sm">{errors.project_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={`${status.color} text-xs`}>
                            {status.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="installation_date" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Installation Date *
                </Label>
                <Input
                  id="installation_date"
                  type="date"
                  value={formData.installation_date}
                  onChange={(e) => handleInputChange('installation_date', e.target.value)}
                  className="bg-white/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                />
                {errors.installation_date && <p className="text-red-500 text-sm">{errors.installation_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_completion" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="h-4 w-4" />
                  Estimated Completion *
                </Label>
                <Input
                  id="estimated_completion"
                  type="date"
                  value={formData.estimated_completion}
                  onChange={(e) => handleInputChange('estimated_completion', e.target.value)}
                  className="bg-white/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                />
                {errors.estimated_completion && <p className="text-red-500 text-sm">{errors.estimated_completion}</p>}
              </div>
            </div>

            {/* Team Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="technician_lead_id" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  Technician Lead *
                </Label>
                <Select 
                  value={formData.technician_lead_id} 
                  onValueChange={(value) => handleInputChange('technician_lead_id', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200">
                    <SelectValue placeholder="Select technician lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(emp => ['technician', 'installation_manager'].includes(emp.role)).map((employee) => (
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
                {errors.technician_lead_id && <p className="text-red-500 text-sm">{errors.technician_lead_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisor_id" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  Supervisor
                </Label>
                <Select 
                  value={formData.supervisor_id || ''} 
                  onValueChange={(value) => handleInputChange('supervisor_id', value || null)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200">
                    <SelectValue placeholder="Select supervisor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(emp => ['supervisor', 'installation_manager'].includes(emp.role)).map((employee) => (
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
            </div>

            {/* Progress and Phase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="current_phase" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  Current Phase *
                </Label>
                <Select 
                  value={formData.current_phase} 
                  onValueChange={(value) => handleInputChange('current_phase', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.current_phase && <p className="text-red-500 text-sm">{errors.current_phase}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress_percentage" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  Progress Percentage (0-100)
                </Label>
                <Input
                  id="progress_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress_percentage}
                  onChange={(e) => handleInputChange('progress_percentage', parseInt(e.target.value) || 0)}
                  className="bg-white/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                />
                {errors.progress_percentage && <p className="text-red-500 text-sm">{errors.progress_percentage}</p>}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Installation Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any specific installation requirements, notes, or considerations..."
                rows={4}
                className="bg-white/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200 resize-none"
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
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Create Installation Tracking
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
