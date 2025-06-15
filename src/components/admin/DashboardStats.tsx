'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import StandardizedStats from '@/components/ui/standardized-stats'
import { 
  Users, 
  ClipboardList,
  BarChart3,
  FileCheck
} from 'lucide-react'
import { IndianRupee } from '@/components/ui/icons/indian-rupee'
import { useDashboard } from '@/contexts/DashboardContext'

interface Stats {
  totalLeads: number
  convertedLeads: number
  activeProjects: number
  pendingInvoices: number
  monthlyRevenue: number
  activeAMCs: number
}

export default function DashboardStats() {
  const { refreshKey } = useDashboard()
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    convertedLeads: 0,
    activeProjects: 0,
    pendingInvoices: 0,
    monthlyRevenue: 0,
    activeAMCs: 0
  })
  const [loading, setLoading] = useState(true)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchStats() {
      try {
        console.log('📊 Fetching dashboard stats... (refresh key:', refreshKey, ')')
        const [
          { count: leadsCount },
          { count: convertedCount },
          { count: projectsCount },
          { count: invoicesCount },
          { data: revenueData },
          { count: amcCount }
        ] = await Promise.all([
          supabase
            .from('consultation_requests')
            .select('*', { count: 'exact', head: true })
            .in('status', ['new', 'contacted', 'qualified', 'proposal_sent']), // Active leads
          supabase
            .from('consultation_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'won'), // Won/Converted leads
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
          convertedLeads: convertedCount || 0,
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
  }, [supabase, refreshKey]) // Add refreshKey as dependency

  const statCards = [
    {
      title: 'Active Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Converted Leads',
      value: stats.convertedLeads,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: ClipboardList,
      color: 'text-orange-600'
    },
    {
      title: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: IndianRupee,
      color: 'text-yellow-600'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(stats.monthlyRevenue / 100000).toFixed(1)}L`,
      icon: BarChart3,
      color: 'text-purple-600'
    }
  ]

  return <StandardizedStats stats={statCards} loading={loading} columns={5} />
}
