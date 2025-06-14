'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDistanceToNow } from 'date-fns'
import { Download, FileText, FileSpreadsheet, Trash2, Edit, UserPlus, X, Search, Filter } from 'lucide-react'
import { notify } from "@/lib/toast"
import { createBrowserClient } from '@supabase/ssr'
import CreateLeadFormDialog from './CreateLeadFormDialog'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  service_type: string
  status: string
  urgency_level: string
  location?: string
  source: string
  created_at: string
  employees?: { full_name: string } | null
}

interface LeadsListProps {
  leads: Lead[]
}

export default function LeadsList({ leads }: LeadsListProps) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleCreateSuccess = () => {
    setIsAddDialogOpen(false)
    // Refresh the page to show updated data
    window.location.reload()
  }

  const handleDelete = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('consultation_requests')
        .delete()
        .eq('id', leadId)

      if (error) throw error

      notify.success('Lead deleted successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error deleting lead:', error)
      notify.error('Failed to delete lead', 'Please try again')
    }
  }

  // Export functions (commented out until packages are installed)
  const exportToExcel = () => {
    showToast.info('Excel export feature will be enabled soon')
    // Implementation will come after package installation
  }

  const exportToPDF = () => {
    showToast.info('PDF export feature will be enabled soon')
    // Implementation will come after package installation
  }

  // Filter leads based on status and search term
  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter
    const matchesSearch = !searchTerm || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.service_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
      contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
      qualified: { label: 'Qualified', color: 'bg-green-100 text-green-800' },
      converted: { label: 'Converted', color: 'bg-purple-100 text-purple-800' },
      lost: { label: 'Lost', color: 'bg-red-100 text-red-800' }
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
      consultation: { label: 'Consultation', color: 'bg-purple-100 text-purple-800' }
    }
    return serviceConfig[serviceType as keyof typeof serviceConfig] || serviceConfig.consultation
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-gray-600">Manage and track your sales leads</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center">
            <Search className="h-5 w-5 mr-2 text-cyan-600" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, phone, or service type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              
              <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first lead.'}
              </p>
              {!searchTerm && filter === 'all' && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Lead
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => {
            const statusBadge = getStatusBadge(lead.status)
            const urgencyBadge = getUrgencyBadge(lead.urgency_level)
            const serviceBadge = getServiceTypeBadge(lead.service_type)

            return (
              <Card key={lead.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {lead.name}
                        </h3>
                        <Badge className={statusBadge.color}>
                          {statusBadge.label}
                        </Badge>
                        <Badge variant="outline" className={urgencyBadge.color}>
                          {urgencyBadge.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Email:</span> {lead.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {lead.phone}
                        </div>
                        <div>
                          <span className="font-medium">Service:</span> 
                          <Badge variant="outline" className={`ml-2 ${serviceBadge.color}`}>
                            {serviceBadge.label}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {lead.location || 'Not specified'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>Source: {lead.source}</span>
                        {lead.employees?.full_name && (
                          <span>Assigned: {lead.employees.full_name}</span>
                        )}
                        <span>Created: {formatDistanceToNow(new Date(lead.created_at))} ago</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50">
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

      {/* Create Lead Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Create New Lead</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddDialogOpen(false)}
              className="hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <CreateLeadFormDialog
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
