'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Save, X, User, Phone, Mail, Building, MapPin, AlertCircle } from 'lucide-react'
import { notify } from '@/lib/toast'

interface CreateLeadFormData {
  name: string
  email: string
  phone: string
  company?: string
  service_type: 'installation' | 'maintenance' | 'repair' | 'consultation'
  message: string
  urgency_level: 'low' | 'medium' | 'high' | 'emergency'
  preferred_contact_method: 'phone' | 'email' | 'whatsapp'
  preferred_contact_time?: string
  location?: string
  property_type: 'residential' | 'commercial' | 'industrial'
  estimated_value?: number
  source: 'website' | 'referral' | 'advertisement' | 'cold_call' | 'walk_in' | 'other'
  notes?: string
}

interface CreateLeadFormDialogProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CreateLeadFormDialog({ onSuccess, onCancel }: CreateLeadFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formData, setFormData] = useState<CreateLeadFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    service_type: 'consultation',
    message: '',
    urgency_level: 'medium',
    preferred_contact_method: 'phone',
    preferred_contact_time: '',
    location: '',
    property_type: 'residential',
    estimated_value: undefined,
    source: 'website',
    notes: ''
  })

  const serviceTypeOptions = [
    { value: 'installation', label: 'Installation', color: 'bg-blue-100 text-blue-800' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-green-100 text-green-800' },
    { value: 'repair', label: 'Repair', color: 'bg-red-100 text-red-800' },
    { value: 'consultation', label: 'Consultation', color: 'bg-purple-100 text-purple-800' }
  ]

  const urgencyLevelOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-800' }
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone format'
    }
    if (!formData.message.trim()) newErrors.message = 'Message/requirement is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      notify.error('Please fix the errors and try again')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company || null,
          service_type: formData.service_type,
          message: formData.message,
          urgency_level: formData.urgency_level,
          preferred_contact_method: formData.preferred_contact_method,
          preferred_contact_time: formData.preferred_contact_time || null,
          location: formData.location || null,
          property_type: formData.property_type,
          estimated_value: formData.estimated_value || null,
          source: formData.source,
          notes: formData.notes || null,
          status: 'new'
        }])

      if (error) throw error

      // COMMENTED OUT: Duplicate toast - NewLeadPage already shows success toast
      // notify.success('Lead created successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error creating lead:', error)
      notify.error('Failed to create lead', 'Please check the form and try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateLeadFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Add New Lead</CardTitle>
                <p className="text-cyan-100 mt-1">Capture potential customer information</p>
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
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200"
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building className="h-4 w-4" />
                  Company/Organization
                </Label>
                <Input
                  id="company"
                  value={formData.company || ''}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Enter company name (optional)"
                  className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200"
                />
              </div>
            </div>

            {/* Service Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="service_type" className="text-sm font-medium text-gray-700">
                  Service Type
                </Label>
                <Select 
                  value={formData.service_type} 
                  onValueChange={(value: any) => handleInputChange('service_type', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypeOptions.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={`${service.color} text-xs`}>
                            {service.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency_level" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <AlertCircle className="h-4 w-4" />
                  Urgency Level
                </Label>
                <Select 
                  value={formData.urgency_level} 
                  onValueChange={(value: any) => handleInputChange('urgency_level', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevelOptions.map((urgency) => (
                      <SelectItem key={urgency.value} value={urgency.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={`${urgency.color} text-xs`}>
                            {urgency.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="property_type" className="text-sm font-medium text-gray-700">
                  Property Type
                </Label>
                <Select 
                  value={formData.property_type} 
                  onValueChange={(value: any) => handleInputChange('property_type', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter location/address"
                  className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="estimated_value" className="text-sm font-medium text-gray-700">
                  Estimated Project Value
                </Label>
                <Input
                  id="estimated_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimated_value || ''}
                  onChange={(e) => handleInputChange('estimated_value', parseFloat(e.target.value))}
                  placeholder="Enter estimated value (optional)"
                  className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source" className="text-sm font-medium text-gray-700">
                  Lead Source
                </Label>
                <Select 
                  value={formData.source} 
                  onValueChange={(value: any) => handleInputChange('source', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="walk_in">Walk-in</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="preferred_contact_method" className="text-sm font-medium text-gray-700">
                  Preferred Contact Method
                </Label>
                <Select 
                  value={formData.preferred_contact_method} 
                  onValueChange={(value: any) => handleInputChange('preferred_contact_method', value)}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_contact_time" className="text-sm font-medium text-gray-700">
                  Preferred Contact Time
                </Label>
                <Input
                  id="preferred_contact_time"
                  value={formData.preferred_contact_time || ''}
                  onChange={(e) => handleInputChange('preferred_contact_time', e.target.value)}
                  placeholder="e.g., 9 AM - 6 PM, Weekends"
                  className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200"
                />
              </div>
            </div>

            {/* Message and Notes */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                Requirements/Message *
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Describe the customer's requirements and needs..."
                rows={4}
                className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200 resize-none"
              />
              {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information or special instructions..."
                rows={3}
                className="bg-white/50 border-gray-200 focus:border-cyan-300 focus:ring-cyan-200 resize-none"
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
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Create Lead
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
