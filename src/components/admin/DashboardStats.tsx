'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  ClipboardList,
  DollarSign,
  BarChart3,
  FileCheck
} from 'lucide-react'

interface Stats {
  totalLeads: number
  activeProjects: number
  pendingInvoices: number
  monthlyRevenue: number
  activeAMCs: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    activeProjects: 0,
    pendingInvoices: 0,
    monthlyRevenue: 0,
    activeAMCs: 0
  })
  const [loading, setLoading] = useState(true)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: leadsCount },
          { count: projectsCount },
          { count: invoicesCount },
          { data: revenueData },
          { count: amcCount }
        ] = await Promise.all([
          supabase
            .from('consultation_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'new'),
          supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .in('status', ['planning', 'in_progress']),
          supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
          supabase
            .from('invoices')
            .select('total_amount')
            .eq('status', 'paid')
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
          supabase
            .from('amc_contracts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
        ])

        const monthlyRevenue = revenueData?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0

        setStats({
          totalLeads: leadsCount || 0,
          activeProjects: projectsCount || 0,
          pendingInvoices: invoicesCount || 0,
          monthlyRevenue,
          activeAMCs: amcCount || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const statCards = [
    {
      title: 'New Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: ClipboardList,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Active AMCs',
      value: stats.activeAMCs,
      icon: FileCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(stats.monthlyRevenue / 100000).toFixed(1)}L`,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
