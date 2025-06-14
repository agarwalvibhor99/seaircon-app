'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent } from '@/components/ui/card'
import { useDashboard } from '@/contexts/DashboardContext'

export default function LeadsStats() {
  const [stats, setStats] = useState({
    newLeads: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
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
          const newLeads = leads.filter(l => l.status === 'new').length
          const contacted = leads.filter(l => l.status === 'contacted').length
          const qualified = leads.filter(l => l.status === 'qualified').length
          const converted = leads.filter(l => l.status === 'converted').length
          const conversionRate = leads.length > 0 ? (converted / leads.length) * 100 : 0

          setStats({
            newLeads,
            contacted,
            qualified,
            converted,
            conversionRate
          })
          
          console.log('📊 Lead statistics updated:', {
            total: leads.length,
            newLeads,
            contacted,
            qualified,
            converted,
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
    { title: 'New Leads', value: stats.newLeads, color: 'text-blue-600' },
    { title: 'Contacted', value: stats.contacted, color: 'text-yellow-600' },
    { title: 'Qualified', value: stats.qualified, color: 'text-green-600' },
    { title: 'Converted', value: stats.converted, color: 'text-purple-600' },
    { title: 'Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, color: 'text-cyan-600' }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-12 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {statCards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-gray-600">{card.title}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
