'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Search, 
  Filter, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  X,
  ArrowUpCircle,
  Building,
  Clock
} from 'lucide-react'
import { DynamicForm, useFormModal } from '@/components/ui/dynamic-form'
import { getLeadFormConfig, getProjectFormConfig } from '@/components/ui/form-config'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { useLeadFormManager } from '@/components/ui/unified-form-manager'
import QuickStatusUpdate from '@/components/admin/leads/QuickStatusUpdate'
import StatusHistoryModal from '@/components/admin/leads/StatusHistoryModal'
import { AutoStatusProgressionService } from '@/lib/auto-status-progression.service'
import { createBrowserClient } from '@supabase/ssr'
import { useDashboard } from '@/contexts/DashboardContext'
import { notify } from '@/lib/toast'
import { formatDistanceToNow } from 'date-fns'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  service_type: string
  message: string
  urgency_level: string
  preferred_contact_method: string
  preferred_contact_time?: string
  location?: string
  property_type: string
  estimated_value?: number
  source: string
  notes?: string
  status: string
  created_at: string
  updated_at: string
}

interface UnifiedLeadsListProps {
  leads: Lead[]
}

interface LeadAnalytics {
  totalLeads: number
  activeLeads: number
  convertedLeads: number
  lostLeads: number
  qualifiedLeads: number
  completedLeads: number
  conversionRate: number
  qualificationRate: number
}

export default function UnifiedLeadsList({ leads }: UnifiedLeadsListProps) {
  const { refreshDashboard } = useDashboard()
  const [filteredLeads, setFilteredLeads] = useState(Array.isArray(leads) ? leads : [])
  const [currentLeads, setCurrentLeads] = useState(Array.isArray(leads) ? leads : []) // Track current leads state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // Changed default to show all leads
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  
  // Lead Analytics State
  const [analytics, setAnalytics] = useState<LeadAnalytics>({
    totalLeads: 0,
    activeLeads: 0,
    convertedLeads: 0,
    lostLeads: 0,
    qualifiedLeads: 0,
    completedLeads: 0,
    conversionRate: 0,
    qualificationRate: 0
  })

  // Modal states
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  
  // Data for project conversion
  const [customers, setCustomers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null)
  const [projectPreFillData, setProjectPreFillData] = useState<any>(null)
  const [isConverting, setIsConverting] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load customers and employees for project conversion
  useEffect(() => {
    loadSupportData()
  }, [])

  // Update leads when props change
  useEffect(() => {
    setCurrentLeads(leads)
    setFilteredLeads(leads)
  }, [leads])

  const loadSupportData = async () => {
    try {
      setIsLoadingData(true)
      
      const [customersResult, employeesResult] = await Promise.all([
        supabase.from('customers').select('*').order('name'),
        supabase.from('employees').select('*').eq('is_active', true).order('full_name')
      ])
      
      setCustomers(customersResult.data || [])
      setEmployees(employeesResult.data || [])
    } catch (error) {
      console.error('Error loading support data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Create form modal - REMOVED: Use form manager instead

  // Edit form modal  
  const leadFormConfig = getLeadFormConfig()
  const {
    isOpen: isEditModalOpen,
    openEditModal,
    closeModal: closeEditModal,
    FormModal: EditFormModal
  } = useFormModal(leadFormConfig, handleUpdateLead, selectedLead || undefined)

  // Convert to project modal - using state for dynamic initial data
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  
  const openConvertModal = () => {
    setIsConvertModalOpen(true)
  }
  
  const closeConvertModal = () => {
    setIsConvertModalOpen(false)
    setProjectPreFillData(null)
    setConvertingLead(null)
  }

  // Function for opening create lead modal
  const handleAddNewLead = () => {
    createFormModal.openCreateModal()
  }

  // handleCreateLead function - REMOVED: Use /admin/leads/new page instead

  async function handleUpdateLead(formData: any) {
    if (!selectedLead) return

    try {
      const { error } = await supabase
        .from('consultation_requests')
        .update(formData)
        .eq('id', selectedLead.id)

      if (error) {
        console.error('Lead update error:', error)
        throw new Error(`Failed to update lead: ${error.message}`)
      }
      
      notify.success('Lead updated successfully')
      setSelectedLead(null)
      // Refresh data
      await fetchLeads()
    } catch (error) {
      console.error('Error updating lead:', error)
      notify.error(`Failed to update lead: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Function to handle converting lead to project
  const handleConvertLead = async (lead: Lead) => {
    // Prevent double conversion
    if (isConverting) {
      console.log('⚠️ Conversion already in progress, ignoring request')
      notify.warning('A conversion is already in progress. Please wait.')
      return
    }

    // Confirm before conversion since lead will be deleted
    const confirmed = confirm(
      `Convert "${lead.name}" to project?\n\n` +
      `This will:\n` +
      `• Create a new project with the lead information\n` +
      `• Remove the lead from the leads list\n` +
      `• All lead details will be preserved in the project notes\n\n` +
      `This action cannot be undone. Continue?`
    )
    
    if (!confirmed) {
      return
    }

    try {
      console.log('=== CONVERT LEAD FUNCTION CALLED ===')
      console.log('Starting lead conversion for:', lead)
      console.log('Customers available:', customers.length)
      console.log('Employees available:', employees.length)
      
      // We can create customers on-the-fly, only employees are required
      if (employees.length === 0) {
        console.log('Employees not loaded, showing error')
        notify.error('Employee data not loaded yet. Please wait and try again.')
        return
      }

      // First, check if customer exists or create one
      let customerId = null
      
      // Try to find existing customer by email or phone
      console.log('Searching for existing customer...')
      const { data: existingCustomer, error: customerSearchError } = await supabase
        .from('customers')
        .select('id')
        .or(`email.eq."${lead.email}",phone.eq."${lead.phone}"`)
        .maybeSingle()

      if (customerSearchError) {
        console.warn('Customer search error:', customerSearchError)
      }

      if (existingCustomer) {
        customerId = existingCustomer.id
        console.log('Found existing customer:', customerId)
      } else {
        console.log('Creating new customer for lead:', lead.name)
        // Create new customer from lead data
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([{
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company || null,
            address: lead.location || '',
            customer_type: 'individual',
            is_active: true
          }])
          .select('id')
          .single()

        if (customerError) {
          console.error('Customer creation error:', customerError)
          throw new Error(`Failed to create customer: ${customerError.message}`)
        }
        
        customerId = newCustomer.id
        console.log('Created new customer:', customerId)
      }

      // Prepare pre-filled project data from lead
      const leadInfo = `
CONVERTED FROM LEAD:
- Lead ID: ${lead.id}
- Customer: ${lead.name} (${lead.email}, ${lead.phone})
- Company: ${lead.company || 'N/A'}
- Service Type: ${lead.service_type}
- Urgency: ${lead.urgency_level}
- Property Type: ${lead.property_type}
- Preferred Contact: ${lead.preferred_contact_method}
- Contact Time: ${lead.preferred_contact_time || 'N/A'}
- Source: ${lead.source}
- Original Message: ${lead.message}
- Original Notes: ${lead.notes || 'None'}
- Conversion Date: ${new Date().toLocaleString()}
`.trim()

      const projectData = {
        project_name: `${lead.service_type} - ${lead.name}`,
        project_type: lead.service_type,
        customer_id: customerId,
        priority: lead.urgency_level === 'high' ? 'high' : 
                 lead.urgency_level === 'medium' ? 'medium' : 'low',
        status: 'draft',
        project_value: lead.estimated_value || 0,
        site_address: lead.location || '',
        description: lead.message,
        notes: leadInfo
      }

      console.log('=== SETTING PROJECT DATA ===')
      console.log('Project data prepared:', projectData)
      
      // Set the converting lead and pre-fill data
      console.log('Setting convertingLead to:', lead.id)
      setConvertingLead(lead)
      
      console.log('Setting projectPreFillData to:', projectData)
      setProjectPreFillData(projectData)
      
      // Add a small delay to ensure state is set before opening modal
      console.log('Waiting 100ms before opening modal...')
      setTimeout(() => {
        console.log('=== ATTEMPTING TO OPEN MODAL ===')
        console.log('About to call openConvertModal()')
        openConvertModal()
        console.log('openConvertModal() called')
      }, 100)
    } catch (error) {
      console.error('Error preparing lead conversion:', error)
      notify.error(`Failed to prepare lead conversion: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async function handleConvertToProject(formData: any) {
    // Prevent double submission
    if (isConverting) {
      console.log('⚠️ Conversion already in progress, ignoring duplicate request')
      return
    }

    if (!convertingLead) {
      console.error('❌ No converting lead found')
      notify.error('No lead selected for conversion')
      return
    }

    try {
      setIsConverting(true)
      console.log('🔄 Starting lead conversion process...')
      console.log('Converting lead:', convertingLead.id, convertingLead.name)
      console.log('Creating project with data:', formData)
      
      // Test toast to verify toast service is working
      console.log('🔍 Testing toast service...')
      try {
        const loadingId = notify.loading('Starting project creation...')
        console.log('✅ Info toast called successfully, ID:', loadingId)
      } catch (toastError) {
        console.error('❌ Error showing info toast:', toastError)
      }
      
      // Step 1: Create the project using the API endpoint
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create project')
      }

      console.log('✅ Project created successfully:', result.data)
      const projectNumber = result.data?.project_number || 'Unknown'

      // Step 2: Mark lead as converted (keep in database for analytics)
      console.log('🔄 Marking lead as won/converted in database:', convertingLead.id)
      
      try {
        const updateResponse = await fetch(`/api/consultation-requests?id=${convertingLead.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'won',
            converted_to_project_id: result.data?.id,
            converted_at: new Date().toISOString()
          })
        })

        console.log('🔍 Update response status:', updateResponse.status, updateResponse.statusText)
        console.log('🔍 Update response headers:', Object.fromEntries(updateResponse.headers.entries()))
        
        const responseText = await updateResponse.text()
        console.log('🔍 Update response text:', responseText)
        
        let updateResult
        try {
          updateResult = JSON.parse(responseText)
          console.log('🔍 Update result parsed:', updateResult)
        } catch (parseError) {
          console.error('❌ Failed to parse update response as JSON:', parseError)
          console.log('📄 Raw response text:', responseText)
          throw new Error(`Invalid JSON response: ${responseText}`)
        }
        
        if (!updateResponse.ok) {
          console.error('❌ Update response not OK:', updateResult)
          throw new Error(`Failed to mark lead as converted: ${updateResult.error || 'Unknown error'}`)
          
        } else if (!updateResult.success) {
          console.error('❌ Update result not successful:', updateResult.error)
          throw new Error(`Failed to mark lead as converted: ${updateResult.error}`)
          
        } else {
          console.log('✅ Lead successfully marked as won/converted')
          
          // Trigger automatic status progression for analytics
          try {
            await AutoStatusProgressionService.onProjectCreated(
              convertingLead.id, 
              convertingLead.status, 
              result.data?.id
            )
            console.log('✅ Automatic status progression completed')
          } catch (progressionError) {
            console.warn('⚠️ Status progression failed (non-critical):', progressionError)
          }
          
          console.log('🎯 About to show success toast...')
          
          try {
            notify.success(`🎉 Lead successfully converted to project ${projectNumber}!`, 
              `The lead is now marked as won and linked to the project. View the project in the projects section.`)
            console.log('✅ Success toast called successfully')
          } catch (toastError) {
            console.error('❌ Error showing success toast:', toastError)
            // Fallback: Show alert if toast fails
            alert(`✅ Lead successfully converted to project ${projectNumber}!`)
          }
          
          // Refresh dashboard stats immediately
          console.log('📊 Triggering dashboard refresh...')
          refreshDashboard()
          
          // Also refresh the leads list to show updated data
          console.log('🔄 Refreshing leads list...')
          await fetchLeads()
        }
      } catch (updateError) {
        console.error('❌ Exception during lead status update:', updateError)
        console.log('⚠️ About to show warning toast...')
        
        try {
          notify.warning(`Project ${projectNumber} created successfully, but failed to update lead status. Please manually update the lead.`,
            'The project was created successfully, but there was an issue updating the lead status. Please check the lead and update it manually if needed.')
          console.log('✅ Warning toast called successfully')
        } catch (toastError) {
          console.error('❌ Error showing warning toast:', toastError)
          // Fallback: Show alert if toast fails
          alert(`⚠️ Project ${projectNumber} created successfully, but failed to update lead status. Please manually update the lead.`)
        }
        
        // Restore lead in UI since status update failed
        console.log('🔄 Restoring lead in UI due to status update failure...')
        await fetchLeads()
      }

      // Step 4: Close modal and clear state
      closeConvertModal()
      setConvertingLead(null)
      setProjectPreFillData(null)
      
    } catch (error) {
      console.error('💥 Error converting lead to project:', error)
      notify.error(`Failed to convert lead to project: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // If project creation failed, ensure lead is still visible
      console.log('🔄 Refreshing leads due to project creation failure...')
      await fetchLeads()
      
    } finally {
      setIsConverting(false)
    }
  }

  // Helper function to mark lead as converted (fallback when deletion fails)
  const markLeadAsConverted = async (leadId: string, projectId: string, projectNumber: string) => {
    try {
      console.log('🔄 Marking lead as converted:', leadId, 'to project:', projectId)
      
      const updateResponse = await fetch(`/api/consultation-requests?id=${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'converted',
          converted_to_project_id: projectId,
          converted_at: new Date().toISOString()
        })
      })

      if (updateResponse.ok) {
        const updateResult = await updateResponse.json()
        if (updateResult.success) {
          console.log('✅ Lead marked as converted successfully')
          notify.success(`🎉 Lead successfully converted to project ${projectNumber}!`)
          return true
        }
      }
      
      console.error('❌ Failed to mark lead as converted')
      notify.warning(`Project ${projectNumber} created successfully, but lead status update failed. Please manually update the lead.`)
      
      // Restore lead in UI since marking as converted failed
      await fetchLeads()
      return false
      
    } catch (error) {
      console.error('❌ Error marking lead as converted:', error)
      notify.warning(`Project ${projectNumber} created successfully, but lead status update failed. Please manually update the lead.`)
      
      // Restore lead in UI since marking as converted failed
      await fetchLeads()
      return false
    }
  }

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead)
    openEditModal(lead)
  }

  const handleView = (lead: Lead) => {
    setSelectedLead(lead)
    setShowViewDialog(true)
  }

  const handleDelete = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return
    }

    try {
      console.log('🗑️ Attempting to delete lead via API:', leadId)
      
      const response = await fetch(`/api/consultation-requests?id=${leadId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete lead')
      }

      console.log('✅ Lead delete successful via API')
      notify.success('Lead deleted successfully')
      await fetchLeads()
    } catch (error) {
      console.error('💥 Error deleting lead:', error)
      notify.error('Failed to delete lead - Please try again')
    }
  }

  // Filter leads based on search and filters
  React.useEffect(() => {
    let filtered = currentLeads

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Enhanced status filtering with all lead categories
    if (statusFilter === 'active') {
      filtered = filtered.filter(lead => ['new', 'contacted', 'qualified', 'proposal_sent'].includes(lead.status))
    } else if (statusFilter === 'converted') {
      filtered = filtered.filter(lead => lead.status === 'won')
    } else if (statusFilter === 'qualified') {
      filtered = filtered.filter(lead => ['qualified', 'proposal_sent'].includes(lead.status))
    } else if (statusFilter === 'lost') {
      filtered = filtered.filter(lead => ['lost', 'cancelled'].includes(lead.status))
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(lead => ['won', 'lost', 'cancelled'].includes(lead.status))
    } else if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter)
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(lead => lead.urgency_level === urgencyFilter)
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.service_type === serviceFilter)
    }

    setFilteredLeads(filtered)
  }, [currentLeads, searchTerm, statusFilter, urgencyFilter, serviceFilter])

  const fetchLeads = async () => {
    try {
      console.log('🔄 Fetching all leads via Supabase...')
      
      // Fetch ALL leads directly from Supabase
      const { data: leadsData, error } = await supabase
        .from('consultation_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      console.log('✅ All leads fetched successfully:', leadsData?.length || 0, 'leads')
      console.log('🔍 Leads by status:', {
        new: leadsData?.filter((lead: any) => lead.status === 'new').length || 0,
        contacted: leadsData?.filter((lead: any) => lead.status === 'contacted').length || 0,
        qualified: leadsData?.filter((lead: any) => lead.status === 'qualified').length || 0,
        proposal_sent: leadsData?.filter((lead: any) => lead.status === 'proposal_sent').length || 0,
        won: leadsData?.filter((lead: any) => lead.status === 'won').length || 0,
        lost: leadsData?.filter((lead: any) => lead.status === 'lost').length || 0,
        cancelled: leadsData?.filter((lead: any) => lead.status === 'cancelled').length || 0,
      })
      
      setCurrentLeads(leadsData || [])
      // Don't set filteredLeads directly - let the useEffect handle filtering
    } catch (error) {
      console.error('❌ Error refreshing leads:', error)
      notify.error('Failed to refresh leads')
      // Ensure filteredLeads is always an array even on error
      setCurrentLeads([])
      setFilteredLeads([])
    }
  }

  // Initialize lead form manager with unified system
  const createFormModal = useLeadFormManager(fetchLeads)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
      contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
      qualified: { label: 'Qualified', color: 'bg-green-100 text-green-800' },
      proposal_sent: { label: 'Proposal Sent', color: 'bg-purple-100 text-purple-800' },
      won: { label: 'Won', color: 'bg-green-100 text-green-800' },
      lost: { label: 'Lost', color: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.new
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
      emergency: { label: 'Emergency', color: 'bg-red-100 text-red-800' }
    }
    return urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.medium
  }

  const getServiceTypeBadge = (serviceType: string) => {
    const serviceConfig = {
      installation: { label: 'Installation', color: 'bg-blue-100 text-blue-800' },
      maintenance: { label: 'Maintenance', color: 'bg-green-100 text-green-800' },
      repair: { label: 'Repair', color: 'bg-red-100 text-red-800' },
      consultation: { label: 'Consultation', color: 'bg-purple-100 text-purple-800' },
      amc: { label: 'AMC', color: 'bg-orange-100 text-orange-800' }
    }
    return serviceConfig[serviceType as keyof typeof serviceConfig] || serviceConfig.consultation
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate lead analytics
  const calculateAnalytics = (leads: Lead[]): LeadAnalytics => {
    const totalLeads = leads.length
    const activeLeads = leads.filter(lead => ['new', 'contacted', 'qualified', 'proposal_sent'].includes(lead.status)).length
    const convertedLeads = leads.filter(lead => lead.status === 'won').length
    const lostLeads = leads.filter(lead => ['lost', 'cancelled'].includes(lead.status)).length
    const qualifiedLeads = leads.filter(lead => ['qualified', 'proposal_sent', 'won'].includes(lead.status)).length
    const completedLeads = leads.filter(lead => ['won', 'lost', 'cancelled'].includes(lead.status)).length
    
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100 * 100) / 100 : 0
    const qualificationRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100 * 100) / 100 : 0

    return {
      totalLeads,
      activeLeads,
      convertedLeads,
      lostLeads,
      qualifiedLeads,
      completedLeads,
      conversionRate,
      qualificationRate
    }
  }

  // Update analytics whenever leads change
  useEffect(() => {
    const newAnalytics = calculateAnalytics(currentLeads)
    setAnalytics(newAnalytics)
  }, [currentLeads])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-600">Manage and track your sales leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddNewLead} className="bg-gray-900 hover:bg-gray-800 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Lead
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building className="h-5 w-5 text-gray-700" />
            Lead Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalLeads}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.activeLeads}</p>
              <p className="text-xs text-gray-500">In progress</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600">Qualified</p>
              <p className="text-2xl font-bold text-green-600">{analytics.qualifiedLeads}</p>
              <p className="text-xs text-gray-500">Ready to convert</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600">Converted</p>
              <p className="text-2xl font-bold text-green-700">{analytics.convertedLeads}</p>
              <p className="text-xs text-gray-500">Won deals</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600">Lost</p>
              <p className="text-2xl font-bold text-red-600">{analytics.lostLeads}</p>
              <p className="text-xs text-gray-500">Lost deals</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-700">{analytics.completedLeads}</p>
              <p className="text-xs text-gray-500">Closed deals</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Success rate</p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-gray-600">Qualification Rate</p>
              <p className="text-xl font-bold text-gray-900">{analytics.qualificationRate.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-gray-600">Active Pipeline</p>
              <p className="text-xl font-bold text-gray-900">{analytics.activeLeads}/{analytics.totalLeads}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-gray-600">Closure Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {analytics.totalLeads > 0 ? ((analytics.completedLeads / analytics.totalLeads) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-gray-600">Win/Loss Ratio</p>
              <p className="text-xl font-bold text-gray-900">
                {analytics.lostLeads > 0 ? (analytics.convertedLeads / analytics.lostLeads).toFixed(1) : analytics.convertedLeads > 0 ? '∞' : '0'}:1
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white border-gray-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="active">Active ({analytics.activeLeads})</SelectItem>
                  <SelectItem value="qualified">Qualified ({analytics.qualifiedLeads})</SelectItem>
                  <SelectItem value="converted">Converted ({analytics.convertedLeads})</SelectItem>
                  <SelectItem value="lost">Lost ({analytics.lostLeads})</SelectItem>
                  <SelectItem value="completed">Completed ({analytics.completedLeads})</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-40 bg-white border-gray-200">
                  <SelectValue placeholder="Filter by urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-40 bg-white border-gray-200">
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="amc">AMC</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all' || serviceFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setUrgencyFilter('all')
                    setServiceFilter('all')
                  }}
                  className="bg-white border-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="grid gap-4">
        {(!Array.isArray(filteredLeads) || filteredLeads.length === 0) ? (
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-8 text-center">
              <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-500">
                {currentLeads.length === 0 
                  ? "No leads have been created yet."
                  : "No leads match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          (Array.isArray(filteredLeads) ? filteredLeads : []).map((lead) => {
            const statusBadge = getStatusBadge(lead.status)
            const urgencyBadge = getUrgencyBadge(lead.urgency_level)
            const serviceBadge = getServiceTypeBadge(lead.service_type)
            
            return (
              <Card key={lead.id} className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                        <QuickStatusUpdate 
                          lead={lead} 
                          onStatusUpdate={() => {
                            fetchLeads()
                            refreshDashboard()
                          }} 
                          onConvertToProject={handleConvertLead}
                          compact={true} 
                        />
                        <Badge className={urgencyBadge.color}>{urgencyBadge.label}</Badge>
                        <Badge className={serviceBadge.color}>{serviceBadge.label}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{lead.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{lead.phone}</span>
                        </div>
                        
                        {lead.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{lead.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Created: {formatDistanceToNow(new Date(lead.created_at))} ago</span>
                        </div>
                      </div>

                      {lead.estimated_value && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="font-medium">Estimated Value:</span>
                          <span className="text-lg font-semibold text-green-600">
                            {formatCurrency(lead.estimated_value)}
                          </span>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-md p-3">
                        <p className="text-sm text-gray-700 line-clamp-2">{lead.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <StatusHistoryModal 
                        leadId={lead.id} 
                        leadName={lead.name}
                        trigger={
                          <Button variant="outline" size="sm" title="View Status History">
                            <Clock className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          console.log('Convert button clicked for lead:', lead.id)
                          handleConvertLead(lead)
                        }}
                        className="text-green-600 hover:bg-green-50 border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Convert to Project & Remove Lead"
                        disabled={isConverting}
                      >
                        <ArrowUpCircle className={`h-4 w-4 ${isConverting ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleView(lead)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(lead)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={handleAddNewLead}
        icon={<UserPlus className="h-6 w-6" />}
        label="Add New Lead"
        variant="monochrome"
      />

      {/* Create Lead Modal - Now using unified form manager */}

      {/* Edit Lead Modal */}
      {selectedLead && <EditFormModal />}

      {/* View Lead Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Lead Details</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedLead && handleConvertLead(selectedLead)}
                className="text-green-600 hover:bg-green-50 border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isConverting}
              >
                <ArrowUpCircle className={`h-4 w-4 mr-2 ${isConverting ? 'animate-spin' : ''}`} />
                {isConverting ? 'Converting...' : 'Convert & Remove Lead'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewDialog(false)}
                className="hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900">{selectedLead.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selectedLead.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900">{selectedLead.phone}</p>
                    </div>
                    {selectedLead.company && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Company</label>
                        <p className="text-sm text-gray-900">{selectedLead.company}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Service Type</label>
                      <Badge className={getServiceTypeBadge(selectedLead.service_type).color}>
                        {getServiceTypeBadge(selectedLead.service_type).label}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Property Type</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedLead.property_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Urgency Level</label>
                      <Badge className={getUrgencyBadge(selectedLead.urgency_level).color}>
                        {getUrgencyBadge(selectedLead.urgency_level).label}
                      </Badge>
                    </div>
                    {selectedLead.estimated_value && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Estimated Value</label>
                        <p className="text-sm text-gray-900 font-semibold">
                          {formatCurrency(selectedLead.estimated_value)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-sm text-gray-700">{selectedLead.message}</p>
                </div>
              </div>

              {selectedLead.notes && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                  <div className="bg-blue-50 rounded-md p-4">
                    <p className="text-sm text-gray-700">{selectedLead.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Convert Lead to Project Modal */}
      {isConvertModalOpen && projectPreFillData && (
        <DynamicForm
          config={{
            ...getProjectFormConfig(customers, employees),
            title: 'Convert Lead to Project',
            subtitle: 'Create a new project from this lead'
          }}
          isOpen={isConvertModalOpen}
          onClose={closeConvertModal}
          onSubmit={handleConvertToProject}
          initialData={projectPreFillData}
          mode="create"
          isSubmitting={isConverting}
        />
      )}

      {/* Form Modal */}
      <createFormModal.FormModal />

    </div>
  )
}
