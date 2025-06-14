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
import { Save, Calendar, MapPin, User, Clock, FileText, AlertCircle } from 'lucide-react'
import { notify } from "@/lib/toast"

interface Lead {
  id: string
  name: string
  phone: string
  location: string
  service_type: string
}

interface Customer {
  id: string
  name: string
  phone: string
  address: string
}

interface Technician {
  id: string
  full_name: string
  role: string
}

interface ScheduleSiteVisitFormDialogProps {
  leads: Lead[]
  customers: Customer[]
  technicians: Technician[]
  preSelectedLeadId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ScheduleSiteVisitFormDialog({ 
  leads, 
  customers, 
  technicians, 
  preSelectedLeadId,
  onSuccess, 
  onCancel 
}: ScheduleSiteVisitFormDialogProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    consultation_request_id: preSelectedLeadId || '',
    customer_id: '',
    visit_date: '',
    visit_time: '',
    technician_id: '',
    supervisor_id: '',
    visit_type: 'assessment',
    priority: 'medium',
    estimated_duration: '2',
    notes: '',
    special_instructions: ''
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.consultation_request_id && !formData.customer_id) {
      newErrors.customer = 'Please select either a lead or existing customer'
    }

    if (!formData.visit_date) {
      newErrors.visit_date = 'Visit date is required'
    }

    if (!formData.visit_time) {
      newErrors.visit_time = 'Visit time is required'
    }

    if (!formData.technician_id) {
      newErrors.technician_id = 'Technician assignment is required'
    }

    // Validate date is not in the past
    if (formData.visit_date) {
      const selectedDate = new Date(formData.visit_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.visit_date = 'Visit date cannot be in the past'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      notify.error('Please fix the errors and try again')
      return
    }

    setLoading(true)

    try {
      const visitData = {
        consultation_request_id: formData.consultation_request_id || null,
        customer_id: formData.customer_id || null,
        visit_date: formData.visit_date,
        visit_time: formData.visit_time,
        technician_id: formData.technician_id,
        supervisor_id: formData.supervisor_id || null,
        visit_type: formData.visit_type,
        priority: formData.priority,
        estimated_duration: parseInt(formData.estimated_duration),
        notes: formData.notes || null,
        special_instructions: formData.special_instructions || null,
        status: 'scheduled'
      }

      const { error } = await supabase
        .from('site_visits')
        .insert([visitData])

      if (error) throw error

      notify.success('Site visit scheduled successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error scheduling site visit:', error)
      notify.error('Failed to schedule site visit', 'Please check the form and try again')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Pre-fill customer when lead is selected
  const handleLeadSelect = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      setFormData(prev => ({
        ...prev,
        consultation_request_id: leadId,
        customer_id: '' // Clear customer selection
      }))
    }
  }

  const visitTypeOptions = [
    { value: 'assessment', label: 'Initial Assessment', color: 'bg-blue-100 text-blue-800' },
    { value: 'technical_survey', label: 'Technical Survey', color: 'bg-green-100 text-green-800' },
    { value: 'quotation_review', label: 'Quotation Review', color: 'bg-purple-100 text-purple-800' },
    { value: 'installation_prep', label: 'Installation Preparation', color: 'bg-orange-100 text-orange-800' },
    { value: 'follow_up', label: 'Follow-up Visit', color: 'bg-gray-100 text-gray-800' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer/Lead Selection */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="consultation_request_id">Select Lead (Optional)</Label>
            <Select value={formData.consultation_request_id} onValueChange={handleLeadSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select from recent leads" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="">No Lead Selected</SelectItem>
                {leads.map(lead => (
                  <SelectItem key={lead.id} value={lead.id}>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">{lead.service_type}</Badge>
                      <span>{lead.name} - {lead.phone}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-center text-gray-500 font-medium">
            OR
          </div>

          <div>
            <Label htmlFor="customer_id">Select Existing Customer</Label>
            <Select 
              value={formData.customer_id} 
              onValueChange={(value) => {
                handleInputChange('customer_id', value)
                if (value) {
                  setFormData(prev => ({ ...prev, consultation_request_id: '' }))
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select existing customer" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="">No Customer Selected</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {errors.customer && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.customer}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visit Details */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Visit Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="visit_date">Visit Date *</Label>
              <Input
                id="visit_date"
                type="date"
                value={formData.visit_date}
                onChange={(e) => handleInputChange('visit_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={errors.visit_date ? 'border-red-500' : ''}
              />
              {errors.visit_date && <p className="text-sm text-red-500 mt-1">{errors.visit_date}</p>}
            </div>

            <div>
              <Label htmlFor="visit_time">Visit Time *</Label>
              <Input
                id="visit_time"
                type="time"
                value={formData.visit_time}
                onChange={(e) => handleInputChange('visit_time', e.target.value)}
                className={errors.visit_time ? 'border-red-500' : ''}
              />
              {errors.visit_time && <p className="text-sm text-red-500 mt-1">{errors.visit_time}</p>}
            </div>

            <div>
              <Label htmlFor="visit_type">Visit Type</Label>
              <Select value={formData.visit_type} onValueChange={(value) => handleInputChange('visit_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visit type" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {visitTypeOptions.map(option => (
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
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {priorityOptions.map(option => (
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
              <Label htmlFor="estimated_duration">Estimated Duration (hours)</Label>
              <Select value={formData.estimated_duration} onValueChange={(value) => handleInputChange('estimated_duration', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="3">3 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="8">8 hours (Full day)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Assignment */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Team Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="technician_id">Assigned Technician *</Label>
              <Select value={formData.technician_id} onValueChange={(value) => handleInputChange('technician_id', value)}>
                <SelectTrigger className={errors.technician_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {technicians
                    .filter(tech => tech.role === 'technician' || tech.role === 'engineer')
                    .map(tech => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.full_name} ({tech.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.technician_id && <p className="text-sm text-red-500 mt-1">{errors.technician_id}</p>}
            </div>

            <div>
              <Label htmlFor="supervisor_id">Supervisor (Optional)</Label>
              <Select value={formData.supervisor_id} onValueChange={(value) => handleInputChange('supervisor_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="">No Supervisor</SelectItem>
                  {technicians
                    .filter(tech => tech.role === 'manager' || tech.role === 'team_lead')
                    .map(tech => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.full_name} ({tech.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => handleInputChange('special_instructions', e.target.value)}
              placeholder="Any special instructions for the technician"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Internal notes about this visit"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Scheduling...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Schedule Visit
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
