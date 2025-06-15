'use client'

import StandardizedStats from '@/components/ui/standardized-stats'
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import { IndianRupee } from '@/components/ui/icons/indian-rupee'

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

  const statCards = [
    { 
      title: 'Total Invoices', 
      value: stats.totalInvoices, 
      icon: FileText, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Pending', 
      value: stats.sentInvoices, 
      subtitle: `${stats.draftInvoices} drafts`,
      icon: Clock, 
      color: 'text-orange-600' 
    },
    { 
      title: 'Paid', 
      value: stats.paidInvoices, 
      subtitle: `${stats.paymentRate}% payment rate`,
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      title: 'Overdue', 
      value: stats.overdueInvoices, 
      subtitle: 'Require attention',
      icon: AlertTriangle, 
      color: 'text-red-600' 
    },
    { 
      title: 'Total Invoiced', 
      value: formatCurrency(stats.totalInvoiced), 
      subtitle: 'All invoices',
      icon: IndianRupee, 
      color: 'text-cyan-600' 
    },
    { 
      title: 'Collected', 
      value: formatCurrency(stats.totalPaid), 
      subtitle: `${formatCurrency(stats.totalOutstanding)} pending`,
      icon: TrendingUp, 
      color: 'text-green-600' 
    }
  ]

  return <StandardizedStats stats={statCards} columns={6} />
}
