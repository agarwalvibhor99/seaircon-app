'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast.service'

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

      console.log('Submitting consultation request:', requestData)
      
      // Direct Supabase insert since the data is already mapped correctly
      const { data: result, error } = await supabase
        .from('consultation_requests')
        .insert(requestData)
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        throw new Error(`Failed to submit consultation request: ${error.message || 'Database error'}`)
      }

      console.log('Submission successful:', result)

      // Show success toast
      showToast.success(
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
      showToast.error(
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
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Request a Consultation</CardTitle>
        <CardDescription className="text-center">
          Get expert HVAC advice tailored to your needs. We&apos;ll respond within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm">{errors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  value={formData.company || ''}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Your company name"
                />
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Service Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type *</Label>
                <select
                  id="service_type"
                  value={formData.service_type}
                  onChange={(e) => handleInputChange('service_type', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="residential_installation">Residential Installation</option>
                  <option value="commercial_hvac">Commercial HVAC</option>
                  <option value="maintenance_service">Maintenance Service</option>
                  <option value="emergency_repair">Emergency Repair</option>
                  <option value="consultation">General Consultation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type</Label>
                <select
                  id="property_type"
                  value={formData.property_type || ''}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select property type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="retail">Retail</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_size">Project Size</Label>
                <select
                  id="project_size"
                  value={formData.project_size || ''}
                  onChange={(e) => handleInputChange('project_size', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select project size</option>
                  <option value="small">Small (1-2 units)</option>
                  <option value="medium">Medium (3-10 units)</option>
                  <option value="large">Large (11-50 units)</option>
                  <option value="enterprise">Enterprise (50+ units)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <select
                  id="urgency"
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Planning ahead</option>
                  <option value="high">High - Need soon</option>
                  <option value="emergency">Emergency - ASAP</option>
                </select>
              </div>
            </div>

            {formData.urgency && (
              <div className="mt-3">
                <Badge className={getUrgencyColor(formData.urgency)}>
                  {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)} Priority
                </Badge>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Project Details *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Please describe your HVAC needs, current issues, or project requirements..."
                rows={4}
                className={errors.message ? 'border-red-500' : ''}
              />
              {errors.message && (
                <p className="text-red-500 text-sm">{errors.message}</p>
              )}
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contact Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                <select
                  id="preferred_contact_method"
                  value={formData.preferred_contact_method}
                  onChange={(e) => handleInputChange('preferred_contact_method', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="phone">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_contact_time">Best Time to Contact</Label>
                <Input
                  id="preferred_contact_time"
                  value={formData.preferred_contact_time || ''}
                  onChange={(e) => handleInputChange('preferred_contact_time', e.target.value)}
                  placeholder="e.g., Weekdays 9-5, Evenings after 6pm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Budget Range (Optional)</Label>
                <Input
                  id="budget_range"
                  value={formData.budget_range || ''}
                  onChange={(e) => handleInputChange('budget_range', e.target.value)}
                  placeholder="e.g., $5,000-$10,000"
                />
              </div>
            </div>
          </div>

          {/* Location (Optional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Service Location (Optional)</h3>
            
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
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full text-lg py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Submit Consultation Request'
              )}
            </Button>
            
            <p className="text-center text-sm text-gray-600 mt-3">
              We'll respond within 24 hours. For emergencies, call us directly at{' '}
              <a href="tel:+15551234567" className="text-cyan-600 hover:underline font-medium">
                +1 (555) 123-4567
              </a>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
