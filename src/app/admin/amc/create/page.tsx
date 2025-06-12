'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function CreateAMCPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    contract_name: '',
    customer_id: '',
    project_id: '',
    contract_type: 'basic',
    start_date: '',
    end_date: '',
    annual_amount: '',
    service_frequency: 'quarterly',
    response_time_hours: '24',
    notes: ''
  })

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Generate contract number
      const contractNumber = `SEA-AMC-${Date.now().toString().slice(-6)}`
      
      const { error } = await supabase
        .from('amc_contracts')
        .insert([
          {
            contract_number: contractNumber,
            ...formData,
            annual_amount: parseFloat(formData.annual_amount)
          }
        ])

      if (error) throw error

      // Redirect to AMC list
      window.location.href = '/admin/amc'
    } catch (error) {
      console.error('Error creating AMC contract:', error)
      alert('Error creating contract. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/admin/amc" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to AMC Contracts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create AMC Contract</h1>
          <p className="mt-2 text-gray-600">
            Create a new annual maintenance contract
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contract_name">Contract Name</Label>
                  <Input
                    id="contract_name"
                    value={formData.contract_name}
                    onChange={(e) => setFormData({ ...formData, contract_name: e.target.value })}
                    placeholder="e.g., Office AC Maintenance - 2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contract_type">Contract Type</Label>
                  <Select 
                    value={formData.contract_type} 
                    onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="annual_amount">Annual Amount (₹)</Label>
                  <Input
                    id="annual_amount"
                    type="number"
                    value={formData.annual_amount}
                    onChange={(e) => setFormData({ ...formData, annual_amount: e.target.value })}
                    placeholder="50000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="service_frequency">Service Frequency</Label>
                  <Select 
                    value={formData.service_frequency} 
                    onValueChange={(value) => setFormData({ ...formData, service_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half_yearly">Half Yearly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="response_time_hours">Response Time (Hours)</Label>
                  <Input
                    id="response_time_hours"
                    type="number"
                    value={formData.response_time_hours}
                    onChange={(e) => setFormData({ ...formData, response_time_hours: e.target.value })}
                    placeholder="24"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional contract terms and conditions..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Contract'}
                </Button>
                
                <Link href="/admin/amc">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
