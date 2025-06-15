'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, Eye, Edit, Calendar, Clock, User, AlertTriangle, CheckCircle, X, Search, Filter, Plus, Users, DollarSign } from 'lucide-react'
import { Employee, Customer } from '@/lib/enhanced-types'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { useAMCFormManager } from '@/components/ui/unified-form-manager'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from "@/lib/toast"

interface AMCContract {
  id: string
  contract_number: string
  customer_id: string
  start_date: string
  end_date: string
  contract_value: number
  status: 'active' | 'expired' | 'cancelled' | 'pending_renewal' | 'draft'
  service_frequency: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly'
  equipment_covered?: string
  terms_conditions?: string
  notes?: string
  customer?: { name: string; phone: string; email: string; address?: string }
  assigned_technician?: { full_name: string; phone?: string }
  sales_manager?: { full_name: string; phone?: string }
  created_at: string
  next_service_date?: string
}

interface UnifiedAMCListProps {
  contracts: AMCContract[]
  employee: Employee
  customers: Customer[]
  employees: Employee[]
}

const statusConfig = {
  active: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
  expired: { color: 'bg-red-100 text-red-800', label: 'Expired', icon: AlertTriangle },
  cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled', icon: X },
  pending_renewal: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Renewal', icon: Clock },
  draft: { color: 'bg-blue-100 text-blue-800', label: 'Draft', icon: Calendar }
}

const frequencyConfig = {
  monthly: { color: 'bg-blue-100 text-blue-800', label: 'Monthly' },
  quarterly: { color: 'bg-green-100 text-green-800', label: 'Quarterly' },
  half_yearly: { color: 'bg-orange-100 text-orange-800', label: 'Half Yearly' },
  yearly: { color: 'bg-purple-100 text-purple-800', label: 'Yearly' }
}

export default function UnifiedAMCList({ contracts, employee, customers, employees }: UnifiedAMCListProps) {
  const [filteredContracts, setFilteredContracts] = useState(contracts)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [frequencyFilter, setFrequencyFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [currentContracts, setCurrentContracts] = useState(contracts)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Initialize form manager with unified system
  const createFormModal = useAMCFormManager(customers, employees, refreshData)

  // Refresh AMC contracts data
  async function refreshData() {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('amc_contracts')
        .select(`
          *,
          customer:customers(name, phone, email, address),
          assigned_technician:employees!amc_contracts_assigned_technician_id_fkey(full_name, phone),
          sales_manager:employees!amc_contracts_sales_manager_id_fkey(full_name, phone)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCurrentContracts(data || [])
      setFilteredContracts(data || [])
      notify.success('AMC contracts refreshed successfully')
    } catch (error) {
      console.error('Error refreshing AMC contracts:', error)
      notify.error('Failed to refresh AMC contracts')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter contracts based on search and filters
  const handleFilter = () => {
    let filtered = currentContracts

    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.customer?.phone.includes(searchTerm) ||
        contract.assigned_technician?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.sales_manager?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.equipment_covered?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter)
    }

    if (frequencyFilter !== 'all') {
      filtered = filtered.filter(contract => contract.service_frequency === frequencyFilter)
    }

    setFilteredContracts(filtered)
  }

  // Apply filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, frequencyFilter, currentContracts])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setFrequencyFilter('all')
  }

  const getContractPriority = (contract: AMCContract) => {
    const endDate = new Date(contract.end_date)
    const now = new Date()
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (contract.status === 'expired') return 4
    if (contract.status === 'pending_renewal') return 3
    if (contract.status === 'active' && diffDays <= 30) return 2 // Expiring soon
    if (contract.status === 'active') return 1
    return 0
  }

  const isExpiringSoon = (contract: AMCContract) => {
    const endDate = new Date(contract.end_date)
    const now = new Date()
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return contract.status === 'active' && diffDays <= 30 && diffDays > 0
  }

  // Sort contracts by priority
  const sortedContracts = [...filteredContracts].sort((a, b) => {
    const priorityDiff = getContractPriority(b) - getContractPriority(a)
    if (priorityDiff !== 0) return priorityDiff
    
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AMC Contracts</h2>
          <p className="text-sm text-gray-600">Manage Annual Maintenance Contracts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
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
                  placeholder="Search by contract number, customer, technician..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-white/30"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/50 border-white/30">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending_renewal">Pending Renewal</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                <SelectTrigger className="w-36 bg-white/50 border-white/30">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequency</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="half_yearly">Half Yearly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
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
      {(searchTerm || statusFilter !== 'all' || frequencyFilter !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>
            Showing {filteredContracts.length} of {currentContracts.length} contracts
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
            {frequencyFilter !== 'all' && ` with "${frequencyFilter}" frequency`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-1 text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Contracts Grid */}
      {sortedContracts.length === 0 ? (
        <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' || frequencyFilter !== 'all' ? 'No matching contracts found' : 'No AMC contracts yet'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || frequencyFilter !== 'all'
                ? 'Try adjusting your search terms or filters' 
                : 'Create your first AMC contract to get started'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && frequencyFilter === 'all') && (
              <Button
                onClick={createFormModal.openCreateModal}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Create First Contract
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedContracts.map((contract) => {
            const StatusIcon = statusConfig[contract.status]?.icon || Shield
            const expiringSoon = isExpiringSoon(contract)
            const isHighPriority = contract.status === 'expired' || contract.status === 'pending_renewal' || expiringSoon
            
            return (
              <Card key={contract.id} className={`group hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/70 border-white/20 shadow-lg hover:bg-white/80 ${expiringSoon ? 'ring-2 ring-yellow-200' : ''} ${contract.status === 'expired' ? 'ring-2 ring-red-200' : ''} ${isHighPriority ? 'border-l-4 border-l-yellow-400' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {contract.contract_number}
                      </CardTitle>
                      <p className="text-sm text-gray-600 truncate">
                        {contract.customer?.name || 'Unknown Customer'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {contract.customer?.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={`${statusConfig[contract.status]?.color} flex items-center gap-1 text-xs`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[contract.status]?.label}
                      </Badge>
                      <Badge className={`${frequencyConfig[contract.service_frequency]?.color} text-xs`}>
                        {frequencyConfig[contract.service_frequency]?.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-semibold text-green-700">{formatCurrency(contract.contract_value)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Start Date:</span>
                      <span>{formatDate(contract.start_date)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">End Date:</span>
                      <span className={contract.status === 'expired' ? 'text-red-600 font-medium' : ''}>{formatDate(contract.end_date)}</span>
                    </div>
                    {contract.assigned_technician?.full_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Technician:</span>
                        <span className="truncate ml-2">{contract.assigned_technician.full_name}</span>
                      </div>
                    )}
                    {contract.equipment_covered && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Equipment:</span>
                        <span className="truncate ml-2">{contract.equipment_covered}</span>
                      </div>
                    )}
                  </div>

                  {expiringSoon && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                      <Clock className="h-4 w-4" />
                      <span>Expiring Soon</span>
                    </div>
                  )}

                  {contract.status === 'expired' && (
                    <div className="flex items-center gap-1 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Contract Expired</span>
                    </div>
                  )}

                  {contract.status === 'pending_renewal' && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                      <Clock className="h-4 w-4" />
                      <span>Pending Renewal</span>
                    </div>
                  )}

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
                      onClick={() => createFormModal.openEditModal(contract)}
                      className="flex-1 bg-white/50 border-white/30 hover:bg-white/70"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {(contract.status === 'expired' || expiringSoon) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
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
        label="Create New Contract"
        variant="monochrome"
      />

      {/* Form Modal */}
      <createFormModal.FormModal />
    </div>
  )
}
