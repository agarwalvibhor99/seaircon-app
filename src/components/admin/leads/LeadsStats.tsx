'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent } from '@/components/ui/card'
import { useDashboard } from '@/contexts/DashboardContext'

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
    { title: 'Total Leads', value: stats.totalLeads, color: 'text-gray-900' },
    { title: 'Active', value: stats.activeLeads, color: 'text-blue-600' },
    { title: 'Qualified', value: stats.qualified, color: 'text-green-600' },
    { title: 'Converted', value: stats.converted, color: 'text-green-700' },
    { title: 'Lost', value: stats.lost, color: 'text-red-600' },
    { title: 'Completed', value: stats.completed, color: 'text-gray-700' },
    { title: 'Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, color: 'text-gray-900' }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Card key={i} className="animate-pulse border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="h-12 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
      {statCards.map((card) => (
        <Card key={card.title} className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-gray-600">{card.title}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
