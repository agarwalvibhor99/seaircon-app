'use client'

import StandardizedStats from '@/components/ui/standardized-stats'
import { ClipboardList, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react'
import { IndianRupee } from '@/components/ui/icons/indian-rupee'

interface AMCContract {
  status: 'active' | 'expired' | 'pending' | 'cancelled'
  annual_amount: number
  start_date: string
  end_date: string
}

interface AMCStatsProps {
  contracts: AMCContract[]
}

export default function AMCStats({ contracts }: AMCStatsProps) {
  const today = new Date()
  
  const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    expiredContracts: contracts.filter(c => c.status === 'expired').length,
    pendingContracts: contracts.filter(c => c.status === 'pending').length,
    expiringContracts: contracts.filter(c => {
      const endDate = new Date(c.end_date)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      return c.status === 'active' && endDate <= thirtyDaysFromNow
    }).length,
    totalRevenue: contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + (c.annual_amount || 0), 0),
    renewalRate: contracts.length > 0 
      ? ((contracts.filter(c => c.status === 'active').length / contracts.length) * 100).toFixed(1)
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
      title: 'Total Contracts', 
      value: stats.totalContracts, 
      icon: ClipboardList, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Active', 
      value: stats.activeContracts, 
      subtitle: `${stats.renewalRate}% active rate`,
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      title: 'Expiring Soon', 
      value: stats.expiringContracts, 
      subtitle: 'Next 30 days',
      icon: AlertTriangle, 
      color: 'text-yellow-600' 
    },
    { 
      title: 'Expired', 
      value: stats.expiredContracts, 
      subtitle: 'Need renewal',
      icon: Clock, 
      color: 'text-red-600' 
    },
    { 
      title: 'Pending', 
      value: stats.pendingContracts, 
      subtitle: 'Awaiting approval',
      icon: Calendar, 
      color: 'text-purple-600' 
    },
    { 
      title: 'Annual Revenue', 
      value: formatCurrency(stats.totalRevenue), 
      subtitle: 'From active contracts',
      icon: IndianRupee, 
      color: 'text-cyan-600' 
    }
  ]

  return <StandardizedStats stats={statCards} columns={6} />
}
