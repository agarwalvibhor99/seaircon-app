'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClipboardList, Eye, Edit, RefreshCw, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react'

interface AMCContract {
  id: string
  contract_number: string
  contract_name: string
  status: 'active' | 'expired' | 'pending' | 'cancelled'
  contract_type: string
  annual_amount: number
  start_date: string
  end_date: string
  service_frequency: string
  response_time_hours: number
  created_at: string
  customers?: { name: string; phone: string; email: string; address: string }
  projects?: { project_name: string; project_number: string }
  assigned_to?: { full_name: string }
  notes?: string
}

interface AMCListProps {
  contracts: AMCContract[]
}

const statusConfig = {
  active: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
  expired: { color: 'bg-red-100 text-red-800', label: 'Expired', icon: AlertTriangle },
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
  cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled', icon: Clock }
}

export default function AMCList({ contracts }: AMCListProps) {
  const [filteredContracts, setFilteredContracts] = useState(contracts)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Filter contracts based on search and filters
  const handleFilter = () => {
    let filtered = contracts

    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.contract_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.customers?.phone.includes(searchTerm) ||
        contract.projects?.project_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter)
    }

    setFilteredContracts(filtered)
  }

  // Apply filters when dependencies change
  useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, contracts])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    return end <= thirtyDaysFromNow && end > today
  }

  const isExpired = (endDate: string, status: string) => {
    const end = new Date(endDate)
    const today = new Date()
    return end < today && status === 'active'
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by contract number, customer, project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="grid gap-4">
        {filteredContracts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
              <p className="text-gray-500">
                {contracts.length === 0 
                  ? "No AMC contracts have been created yet."
                  : "No contracts match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredContracts.map((contract) => {
            const StatusIcon = statusConfig[contract.status].icon
            const expiringSoon = isExpiringSoon(contract.end_date)
            const expired = isExpired(contract.end_date, contract.status)
            
            return (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contract.contract_number}
                        </h3>
                        <Badge className={statusConfig[contract.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[contract.status].label}
                        </Badge>
                        {expiringSoon && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expiring Soon
                          </Badge>
                        )}
                        {expired && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Contract Name:</span>
                          <br />
                          {contract.contract_name}
                        </div>
                        
                        <div>
                          <span className="font-medium">Customer:</span>
                          <br />
                          {contract.customers?.name || 'N/A'}
                        </div>
                        
                        <div>
                          <span className="font-medium">Annual Amount:</span>
                          <br />
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(contract.annual_amount)}
                          </span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Contract Period:</span>
                          <br />
                          {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Service: {contract.service_frequency}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Response: {contract.response_time_hours}hrs</span>
                        </div>
                        <span>Type: {contract.contract_type}</span>
                        {contract.assigned_to && (
                          <span>Assigned: {contract.assigned_to.full_name}</span>
                        )}
                      </div>

                      {contract.projects && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <ClipboardList className="h-4 w-4" />
                          <span>
                            Project: {contract.projects.project_name} 
                            ({contract.projects.project_number})
                          </span>
                        </div>
                      )}

                      {contract.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{contract.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {contract.status !== 'cancelled' && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      
                      {(contract.status === 'expired' || expiringSoon) && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Renew
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
