'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Phone, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { notify } from '@/lib/toast'

type ContactFormData = {
  full_name: string
  email: string
  phone: string
  company?: string
  service_type: 'residential_installation' | 'commercial_hvac' | 'maintenance_service' | 'emergency_repair' | 'consultation' | 'other'
  property_type?: 'residential' | 'commercial' | 'industrial' | 'retail' | 'office' | 'other'
  project_size?: 'small' | 'medium' | 'large' | 'enterprise'
  message: string
  preferred_contact_method: 'phone' | 'email' | 'whatsapp'
  preferred_contact_time?: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  budget_range?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
}

interface ContactFormProps {
  onSuccess?: () => void
  className?: string
}

export default function ContactForm({ onSuccess, className = '' }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<ContactFormData>({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    service_type: 'residential_installation',
    property_type: 'residential',
    project_size: 'medium',
    message: '',
    preferred_contact_method: 'phone',
    preferred_contact_time: '',
    urgency: 'medium',
    budget_range: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name || formData.full_name.length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters'
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    if (!formData.message || formData.message.length < 10) {
      newErrors.message = 'Please provide more details about your request'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Map form service types to database service types
      const mapServiceType = (formServiceType: string): 'installation' | 'maintenance' | 'repair' | 'consultation' => {
        switch (formServiceType) {
          case 'residential_installation':
          case 'commercial_hvac':
            return 'installation'
          case 'maintenance_service':
            return 'maintenance'
          case 'emergency_repair':
            return 'repair'
          case 'consultation':
          case 'other':
          default:
            return 'consultation'
        }
      }

      // Map form data to database schema fields
      const requestData: {
        name: string;
        email: string;
        phone: string;
        company?: string;
        service_type: 'installation' | 'maintenance' | 'repair' | 'consultation';
        message: string;
        urgency_level: 'low' | 'medium' | 'high' | 'emergency';
        status: 'new';
        source: 'website';
      } = {
        name: formData.full_name,  // Database uses 'name' not 'full_name'
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        service_type: mapServiceType(formData.service_type),
        message: formData.message,
        urgency_level: formData.urgency,  // Database uses 'urgency_level' not 'urgency'
        status: 'new' as const,
        source: 'website' as const,
      }
      
      // Direct Supabase insert since the data is already mapped correctly
      const { data: result, error } = await supabase
        .from('consultation_requests')
        .insert(requestData)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to submit consultation request: ${error.message || 'Database error'}`)
      }

      // Show success toast
      notify.success(
        'Request submitted successfully!', 
        'We\'ll get back to you within 24 hours.'
      )

      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        company: '',
        service_type: 'residential_installation',
        property_type: 'residential',
        project_size: 'medium',
        message: '',
        preferred_contact_method: 'phone',
        preferred_contact_time: '',
        urgency: 'medium',
        budget_range: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
      })
      onSuccess?.()

    } catch (error) {
      console.error('Form submission error:', error)
      notify.error(
        'Submission failed', 
        'There was an error submitting your request. Please try again or call us directly.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-gray-400 text-gray-900 border-gray-500'
      case 'medium': return 'bg-gray-200 text-gray-700 border-gray-300'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm ${className}`}>
      <CardHeader className="bg-gray-900 text-white rounded-t-lg">
        <CardTitle className="text-3xl font-bold text-center">Request a Consultation</CardTitle>
        <CardDescription className="text-center text-gray-50 text-lg">
          Get expert HVAC advice tailored to your needs. We&apos;ll respond within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Phone className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${errors.full_name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                />
                {errors.full_name && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="company" className="text-sm font-semibold text-gray-700">Company <span className="text-gray-500 font-normal">(Optional)</span></Label>
                <Input
                  id="company"
                  value={formData.company || ''}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Your company name"
                  className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 hover:border-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Service Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="service_type" className="text-sm font-semibold text-gray-700">Service Type *</Label>
                <Select value={formData.service_type} onValueChange={(value) => handleInputChange('service_type', value)}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential_installation">Residential Installation</SelectItem>
                    <SelectItem value="commercial_hvac">Commercial HVAC</SelectItem>
                    <SelectItem value="maintenance_service">Maintenance Service</SelectItem>
                    <SelectItem value="emergency_repair">Emergency Repair</SelectItem>
                    <SelectItem value="consultation">General Consultation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="property_type" className="text-sm font-semibold text-gray-700">Property Type</Label>
                <Select value={formData.property_type || ''} onValueChange={(value) => handleInputChange('property_type', value)}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="project_size" className="text-sm font-semibold text-gray-700">Project Size</Label>
                <Select value={formData.project_size || ''} onValueChange={(value) => handleInputChange('project_size', value)}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Select project size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1-2 units)</SelectItem>
                    <SelectItem value="medium">Medium (3-10 units)</SelectItem>
                    <SelectItem value="large">Large (11-50 units)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (50+ units)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="urgency" className="text-sm font-semibold text-gray-700">Urgency Level</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General inquiry</SelectItem>
                    <SelectItem value="medium">Medium - Planning ahead</SelectItem>
                    <SelectItem value="high">High - Need soon</SelectItem>
                    <SelectItem value="emergency">Emergency - ASAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.urgency && (
              <div className="mt-3">
                <Badge className={getUrgencyColor(formData.urgency)}>
                  {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)} Priority
                </Badge>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="message" className="text-sm font-semibold text-gray-700">Project Details *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Please describe your HVAC needs, current issues, or project requirements..."
                rows={4}
                className={`transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
              />
              {errors.message && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.message}
                </p>
              )}
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-green-100">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Contact Preferences</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="preferred_contact_method" className="text-sm font-semibold text-gray-700">Preferred Contact Method</Label>
                <Select value={formData.preferred_contact_method} onValueChange={(value) => handleInputChange('preferred_contact_method', value)}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="preferred_contact_time" className="text-sm font-semibold text-gray-700">Best Time to Contact</Label>
                <Input
                  id="preferred_contact_time"
                  value={formData.preferred_contact_time || ''}
                  onChange={(e) => handleInputChange('preferred_contact_time', e.target.value)}
                  placeholder="e.g., Weekdays 9-5, Evenings after 6pm"
                  className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 hover:border-gray-400"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="budget_range" className="text-sm font-semibold text-gray-700">Budget Range <span className="text-gray-500 font-normal">(Optional)</span></Label>
                <Input
                  id="budget_range"
                  value={formData.budget_range || ''}
                  onChange={(e) => handleInputChange('budget_range', e.target.value)}
                  placeholder="e.g., $5,000-$10,000"
                  className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 hover:border-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Location (Optional) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-purple-100">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Service Location <span className="text-sm text-gray-500 font-normal">(Optional)</span></h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code || ''}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="ZIP/Postal code"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full text-lg py-6 bg-gray-900 hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Consultation Request
                </>
              )}
            </Button>
            
            <div className="text-center mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <p className="text-sm text-cyan-800">
                <strong>We'll respond within 24 hours.</strong> For emergencies, call us directly at{' '}
                <a href="tel:+15551234567" className="text-cyan-600 hover:underline font-medium">
                  +1 (555) 123-4567
                </a>
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
