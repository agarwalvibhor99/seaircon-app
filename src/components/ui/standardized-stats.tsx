'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatItemProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  color?: string
}

interface StandardizedStatsProps {
  stats: StatItemProps[]
  loading?: boolean
  columns?: 'auto' | 2 | 3 | 4 | 5 | 6 | 7
}

export default function StandardizedStats({ stats, loading = false, columns = 'auto' }: StandardizedStatsProps) {
  const getGridClasses = () => {
    switch (columns) {
      case 2: return 'grid-cols-1 md:grid-cols-2'
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      case 5: return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'
      case 6: return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
      case 7: return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-7'
      default: return `grid-cols-1 md:grid-cols-${Math.min(3, stats.length)} lg:grid-cols-${Math.min(6, stats.length)}`
    }
  }

  if (loading) {
    return (
      <div className={`grid ${getGridClasses()} gap-4`}>
        {Array.from({ length: stats.length || 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid ${getGridClasses()} gap-4`}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card key={`${stat.title}-${index}`} className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                {IconComponent && (
                  <IconComponent className={`h-8 w-8 ${stat.color || 'text-gray-600'} flex-shrink-0`} />
                )}
                <div className={IconComponent ? 'ml-4' : ''}>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.subtitle && (
                    <p className={`text-xs ${stat.color || 'text-gray-500'}`}>{stat.subtitle}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
