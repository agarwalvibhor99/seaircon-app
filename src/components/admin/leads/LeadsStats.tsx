'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useDashboard } from '@/contexts/DashboardContext'
import StandardizedStats from '@/components/ui/standardized-stats'
import { Users, UserCheck, Target, Trophy, XCircle, CheckCircle, TrendingUp } from 'lucide-react'

export default function LeadsStats() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
    completed: 0,
    conversionRate: 0
  })
  const [loading, setLoading] = useState(true)
  
  const { refreshKey } = useDashboard()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        console.log('📊 Fetching lead statistics...')
        
        const { data: leads } = await supabase
          .from('consultation_requests')
          .select('status')

        if (leads) {
          const totalLeads = leads.length
          const activeLeads = leads.filter(l => ['new', 'contacted', 'qualified', 'proposal_sent'].includes(l.status)).length
          const qualified = leads.filter(l => ['qualified', 'proposal_sent', 'won'].includes(l.status)).length
          const converted = leads.filter(l => l.status === 'won').length
          const lost = leads.filter(l => ['lost', 'cancelled'].includes(l.status)).length
          const completed = leads.filter(l => ['won', 'lost', 'cancelled'].includes(l.status)).length
          const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0

          setStats({
            totalLeads,
            activeLeads,
            qualified,
            converted,
            lost,
            completed,
            conversionRate
          })
          
          console.log('📊 Lead statistics updated:', {
            totalLeads,
            activeLeads,
            qualified,
            converted,
            lost,
            completed,
            conversionRate: conversionRate.toFixed(1) + '%'
          })
        }
      } catch (error) {
        console.error('Error fetching leads stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase, refreshKey])

  const statCards = [
    { title: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'text-gray-600' },
    { title: 'Active', value: stats.activeLeads, icon: UserCheck, color: 'text-blue-600' },
    { title: 'Qualified', value: stats.qualified, icon: Target, color: 'text-green-600' },
    { title: 'Converted', value: stats.converted, icon: Trophy, color: 'text-green-700' },
    { title: 'Lost', value: stats.lost, icon: XCircle, color: 'text-red-600' },
    { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-gray-700' },
    { title: 'Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-blue-600' }
  ]

  return <StandardizedStats stats={statCards} loading={loading} columns={7} />
}
