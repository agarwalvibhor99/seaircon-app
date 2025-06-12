'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FileText, Clock, CheckCircle, XCircle, DollarSign, TrendingUp } from 'lucide-react'

interface Quotation {
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  total_amount: number
}

interface QuotationsStatsProps {
  quotations: Quotation[]
}

export default function QuotationsStats({ quotations }: QuotationsStatsProps) {
  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    approved: quotations.filter(q => q.status === 'approved').length,
    rejected: quotations.filter(q => q.status === 'rejected').length,
    expired: quotations.filter(q => q.status === 'expired').length,
    totalValue: quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0),
    approvedValue: quotations
      .filter(q => q.status === 'approved')
      .reduce((sum, q) => sum + (q.total_amount || 0), 0),
    conversionRate: quotations.length > 0 
      ? ((quotations.filter(q => q.status === 'approved').length / quotations.length) * 100).toFixed(1)
      : '0'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Quotations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
              <p className="text-xs text-gray-500">{stats.draft} drafts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-xs text-green-600">{stats.conversionRate}% conversion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-xs text-gray-500">{stats.expired} expired</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-cyan-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-gray-500">All quotations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Won Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.approvedValue)}</p>
              <p className="text-xs text-green-600">Approved quotes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
