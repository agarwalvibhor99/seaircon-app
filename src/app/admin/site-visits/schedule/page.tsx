'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ScheduleSiteVisitPage() {
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState<Array<{id: string; name: string; phone: string; location: string}>>([])
  const [customers, setCustomers] = useState<Array<{id: string; name: string; phone: string; address: string}>>([])
  const [technicians, setTechnicians] = useState<Array<{id: string; full_name: string; role: string}>>([])
  const [formData, setFormData] = useState({
    consultation_request_id: '',
    customer_id: '',
    visit_date: '',
    visit_time: '',
    technician_id: '',
    supervisor_id: '',
    visit_type: 'assessment',
    notes: ''
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // Pre-fill lead if coming from leads page
  const leadId = searchParams.get('lead')

  const fetchData = useCallback(async () => {
    try {
      const [
        { data: leadsData },
        { data: customersData },
        { data: techniciansData }
      ] = await Promise.all([
        supabase
          .from('consultation_requests')
          .select('id, name, phone, location')
          .eq('status', 'new')
          .order('created_at', { ascending: false }),
        supabase
          .from('customers')
          .select('id, name, phone, address')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('employees')
          .select('id, full_name, role')
          .in('role', ['technician', 'manager', 'employee'])
          .eq('is_active', true)
      ])

      setLeads(leadsData || [])
      setCustomers(customersData || [])
      setTechnicians(techniciansData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
    if (leadId) {
      setFormData(prev => ({ ...prev, consultation_request_id: leadId }))
    }
  }, [leadId, fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Combine date and time
      const visitDateTime = new Date(`${formData.visit_date}T${formData.visit_time}`)

      const visitData = {
        consultation_request_id: formData.consultation_request_id || null,
        customer_id: formData.customer_id || null,
        visit_date: visitDateTime.toISOString(),
        technician_id: formData.technician_id,
        supervisor_id: formData.supervisor_id || null,
        visit_type: formData.visit_type,
        status: 'scheduled',
        notes: formData.notes
      }

      const { error } = await supabase
        .from('site_visits')
        .insert([visitData])

      if (error) throw error

      // Update lead status if scheduling for a lead
      if (formData.consultation_request_id) {
        await supabase
          .from('consultation_requests')
          .update({ status: 'site_visit_scheduled' })
          .eq('id', formData.consultation_request_id)
      }

      router.push('/admin/site-visits')
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule visit'
      console.error('Error scheduling visit:', error)
      alert('Error scheduling visit: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Site Visit</h1>
          <p className="mt-2 text-gray-600">Book a site assessment for customer</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="consultation_request_id">Select Lead (Optional)</Label>
                  <Select value={formData.consultation_request_id} onValueChange={(value) => handleInputChange('consultation_request_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.name} - {lead.phone} ({lead.location})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="customer_id">Or Select Existing Customer</Label>
                  <Select value={formData.customer_id} onValueChange={(value) => handleInputChange('customer_id', value)}>
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
              </div>

              {/* Visit Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="visit_date">Visit Date *</Label>
                  <Input
                    id="visit_date"
                    type="date"
                    min={today}
                    value={formData.visit_date}
                    onChange={(e) => handleInputChange('visit_date', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="visit_time">Visit Time *</Label>
                  <Input
                    id="visit_time"
                    type="time"
                    value={formData.visit_time}
                    onChange={(e) => handleInputChange('visit_time', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Team Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="technician_id">Technician *</Label>
                  <Select value={formData.technician_id} onValueChange={(value) => handleInputChange('technician_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.filter((t) => t.role === 'technician').map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="supervisor_id">Supervisor (Optional)</Label>
                  <Select value={formData.supervisor_id} onValueChange={(value) => handleInputChange('supervisor_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.filter((t) => ['manager', 'employee'].includes(t.role)).map((sup) => (
                        <SelectItem key={sup.id} value={sup.id}>
                          {sup.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Visit Type */}
              <div>
                <Label htmlFor="visit_type">Visit Type</Label>
                <Select value={formData.visit_type} onValueChange={(value) => handleInputChange('visit_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assessment">Initial Assessment</SelectItem>
                    <SelectItem value="follow_up">Follow-up Visit</SelectItem>
                    <SelectItem value="maintenance">Maintenance Check</SelectItem>
                    <SelectItem value="installation_prep">Installation Preparation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Visit Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  placeholder="Special instructions, requirements, or notes for the technician..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || (!formData.consultation_request_id && !formData.customer_id)}
                >
                  {loading ? 'Scheduling...' : 'Schedule Visit'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
