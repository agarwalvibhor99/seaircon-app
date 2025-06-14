'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, CheckCircle, Clock, AlertTriangle, DollarSign, Calendar } from 'lucide-react'

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <ClipboardList className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contracts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
              <p className="text-xs text-green-600">{stats.renewalRate}% active rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expiringContracts}</p>
              <p className="text-xs text-yellow-600">Next 30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expiredContracts}</p>
              <p className="text-xs text-red-600">Need renewal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingContracts}</p>
              <p className="text-xs text-purple-600">Awaiting approval</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-cyan-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Annual Revenue</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-gray-500">From active contracts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
