'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Eye, Edit, Download, Send, CheckCircle, XCircle, Clock, Search, Filter, X, Plus } from 'lucide-react'
import { Employee, Customer, Project } from '@/lib/enhanced-types'
import { useQuotationFormManager } from '@/components/ui/unified-form-manager'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { SectionHeader, SearchFilterBar } from '@/components/ui/section-header'
import { StatusBadge, ActionButtons, DataCell, ContactInfo, formatCurrency, formatDate } from '@/components/ui/data-table-components'
import { statusConfigs } from '@/lib/design-system'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"

interface ConsultationRequest {
  id: string
  name: string
  email: string
  phone: string
  service_type: string
  message: string
}

interface Quotation {
  id: string
  quotation_number: string
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  total_amount: number
  valid_until: string
  created_at: string
  consultation_requests?: { name: string; phone: string; email: string }
  customers?: { name: string; phone: string; email: string }
  created_by?: { full_name: string }
  approved_by?: { full_name: string }
  notes?: string
}

interface UnifiedQuotationsListProps {
  quotations: Quotation[]
  employee: Employee
  customers: Customer[]
  projects: Project[]
  consultationRequests: ConsultationRequest[]
}

export default function UnifiedQuotationsList({ quotations, employee, customers, projects, consultationRequests }: UnifiedQuotationsListProps) {
  const [filteredQuotations, setFilteredQuotations] = useState(quotations)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuotations, setCurrentQuotations] = useState(quotations)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Initialize form manager with unified system
  const createFormModal = useQuotationFormManager(customers, projects, consultationRequests, refreshData)

  // Refresh quotations data
  async function refreshData() {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          consultation_requests(name, phone, email),
          customers(name, phone, email),
          created_by:employees!quotations_created_by_fkey(full_name),
          approved_by:employees!quotations_approved_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCurrentQuotations(data || [])
      setFilteredQuotations(data || [])
      notify.success('Quotations refreshed successfully')
    } catch (error) {
      console.error('Error refreshing quotations:', error)
      notify.error('Failed to refresh quotations')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter quotations based on search and filters
  const handleFilter = () => {
    let filtered = currentQuotations

    if (searchTerm) {
      filtered = filtered.filter(quotation =>
        quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.consultation_requests?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.consultation_requests?.phone.includes(searchTerm) ||
        quotation.customers?.phone.includes(searchTerm) ||
        quotation.created_by?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(quotation => quotation.status === statusFilter)
    }

    setFilteredQuotations(filtered)
  }

  // Apply filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, currentQuotations])

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quotations</h2>
          <p className="text-sm text-gray-600">Manage customer quotations and proposals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by quotation number, customer, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-white/30"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/50 border-white/30">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="bg-white/50 border-white/30 hover:bg-white/70"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {(searchTerm || statusFilter !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>
            Showing {filteredQuotations.length} of {currentQuotations.length} quotations
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-1 text-gray-600 hover:text-gray-800"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Quotations Grid */}
      {filteredQuotations.length === 0 ? (
        <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No matching quotations found' : 'No quotations yet'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search terms or filters' 
                : 'Create your first quotation to get started'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Button
                onClick={createFormModal.openCreateModal}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create First Quotation
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuotations.map((quotation) => {
            return (
              <Card key={quotation.id} className="group hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/70 border-white/20 shadow-lg hover:bg-white/80">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {quotation.quotation_number}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        <ContactInfo 
                          name={quotation.consultation_requests?.name || quotation.customers?.name || 'N/A'}
                          phone={quotation.consultation_requests?.phone || quotation.customers?.phone}
                          showPhone={false}
                        />
                      </p>
                    </div>
                    <StatusBadge 
                      status={quotation.status} 
                      statusConfig={statusConfigs.quotations}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-gray-700">{formatCurrency(quotation.total_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valid Until:</span>
                      <span>{formatDate(quotation.valid_until)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span>{formatDate(quotation.created_at)}</span>
                    </div>
                    {quotation.created_by?.full_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Created by:</span>
                        <span>{quotation.created_by.full_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white/50 border-white/30 hover:bg-white/70"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => createFormModal.openEditModal(quotation)}
                      className="flex-1 bg-white/50 border-white/30 hover:bg-white/70"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/50 border-white/30 hover:bg-white/70"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={createFormModal.openCreateModal}
        icon={<Plus className="h-6 w-6" />}
        label="Create New Quotation"
        variant="monochrome"
      />

      {/* Form Modal */}
      <createFormModal.FormModal />
    </div>
  )
}
