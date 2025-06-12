'use client'

import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, FileText, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react'

interface Invoice {
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  total_amount: number
  due_date: string
}

interface Payment {
  amount: number
  status: 'pending' | 'completed' | 'failed'
  payment_date: string
}

interface InvoicingStatsProps {
  invoices: Invoice[]
  payments: Payment[]
}

export default function InvoicingStats({ invoices }: InvoicingStatsProps) {
  const today = new Date()
  
  const stats = {
    totalInvoices: invoices.length,
    draftInvoices: invoices.filter(i => i.status === 'draft').length,
    sentInvoices: invoices.filter(i => i.status === 'sent').length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
    overdueInvoices: invoices.filter(i => i.status === 'overdue' || (i.status === 'sent' && new Date(i.due_date) < today)).length,
    totalInvoiced: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
    totalPaid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0),
    totalOutstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + (i.total_amount || 0), 0),
    paymentRate: invoices.length > 0 
      ? ((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100).toFixed(1)
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sentInvoices}</p>
              <p className="text-xs text-gray-500">{stats.draftInvoices} drafts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paidInvoices}</p>
              <p className="text-xs text-green-600">{stats.paymentRate}% payment rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdueInvoices}</p>
              <p className="text-xs text-red-600">Require attention</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-cyan-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invoiced</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalInvoiced)}</p>
              <p className="text-xs text-gray-500">All invoices</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Collected</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalPaid)}</p>
              <p className="text-xs text-orange-600">{formatCurrency(stats.totalOutstanding)} pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
