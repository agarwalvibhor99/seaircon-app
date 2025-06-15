'use client'

import StandardizedStats from '@/components/ui/standardized-stats'
import { FileText, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { IndianRupee } from '@/components/ui/icons/indian-rupee'

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

  const statCards = [
    { 
      title: 'Total Quotations', 
      value: stats.total, 
      icon: FileText, 
      color: 'text-gray-600' 
    },
    { 
      title: 'Pending', 
      value: stats.sent, 
      subtitle: `${stats.draft} drafts`,
      icon: Clock, 
      color: 'text-orange-600' 
    },
    { 
      title: 'Approved', 
      value: stats.approved, 
      subtitle: `${stats.conversionRate}% conversion`,
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      title: 'Rejected', 
      value: stats.rejected, 
      subtitle: `${stats.expired} expired`,
      icon: XCircle, 
      color: 'text-red-600' 
    },
    { 
      title: 'Total Value', 
      value: formatCurrency(stats.totalValue), 
      subtitle: 'All quotations',
      icon: IndianRupee, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Won Value', 
      value: formatCurrency(stats.approvedValue), 
      subtitle: 'Approved quotes',
      icon: TrendingUp, 
      color: 'text-green-600' 
    }
  ]

  return <StandardizedStats stats={statCards} columns={6} />
}
