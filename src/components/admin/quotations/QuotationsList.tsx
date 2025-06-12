'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Eye, Edit, Download, Send, CheckCircle, XCircle, Clock } from 'lucide-react'

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

interface QuotationsListProps {
  quotations: Quotation[]
}

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FileText },
  sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent', icon: Send },
  approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle },
  expired: { color: 'bg-orange-100 text-orange-800', label: 'Expired', icon: Clock }
}

export default function QuotationsList({ quotations }: QuotationsListProps) {
  const [filteredQuotations, setFilteredQuotations] = useState(quotations)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Filter quotations based on search and filters
  const handleFilter = () => {
    let filtered = quotations

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
  }, [searchTerm, statusFilter, quotations])

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

  const isExpiringSoon = (validUntil: string) => {
    const today = new Date()
    const expiryDate = new Date(validUntil)
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  const isExpired = (validUntil: string) => {
    const today = new Date()
    const expiryDate = new Date(validUntil)
    return expiryDate < today
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by quotation number, customer name, phone..."
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <div className="grid gap-4">
        {filteredQuotations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
              <p className="text-gray-500">
                {quotations.length === 0 
                  ? "No quotations have been created yet."
                  : "No quotations match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQuotations.map((quotation) => {
            const StatusIcon = statusConfig[quotation.status].icon
            const expiringSoon = isExpiringSoon(quotation.valid_until)
            const expired = isExpired(quotation.valid_until)
            
            return (
              <Card key={quotation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {quotation.quotation_number}
                        </h3>
                        <Badge className={statusConfig[quotation.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[quotation.status].label}
                        </Badge>
                        {expiringSoon && !expired && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Expiring Soon
                          </Badge>
                        )}
                        {expired && quotation.status !== 'expired' && (
                          <Badge className="bg-red-100 text-red-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Customer:</span>
                          <br />
                          {quotation.consultation_requests?.name || quotation.customers?.name}
                        </div>
                        
                        <div>
                          <span className="font-medium">Amount:</span>
                          <br />
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(quotation.total_amount)}
                          </span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Created:</span>
                          <br />
                          {formatDate(quotation.created_at)}
                        </div>
                        
                        <div>
                          <span className="font-medium">Valid Until:</span>
                          <br />
                          <span className={expired ? 'text-red-600' : expiringSoon ? 'text-yellow-600' : ''}>
                            {formatDate(quotation.valid_until)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created by: {quotation.created_by?.full_name}</span>
                        {quotation.approved_by && (
                          <span>Approved by: {quotation.approved_by.full_name}</span>
                        )}
                      </div>

                      {quotation.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{quotation.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {quotation.status === 'draft' && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      
                      {quotation.status === 'draft' && (
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                          <Send className="h-4 w-4 mr-1" />
                          Send
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
