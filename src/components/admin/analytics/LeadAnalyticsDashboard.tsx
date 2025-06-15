// Lead Conversion Analytics Dashboard
// Showcases the power of Solution 1: Historical lead data tracking

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Clock, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react'
import { LeadAnalyticsService, ConversionMetrics, LeadConversionDetails } from '@/lib/lead-analytics.service'

export default function LeadAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null)
  const [conversionDetails, setConversionDetails] = useState<LeadConversionDetails[]>([])
  const [sourceRates, setSourceRates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y' | 'all'>('90d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [metricsData, detailsData, sourceData] = await Promise.all([
        LeadAnalyticsService.getConversionMetrics(timeframe),
        LeadAnalyticsService.getConversionDetails(20),
        LeadAnalyticsService.getSourceSuccessRates()
      ])

      setMetrics(metricsData)
      setConversionDetails(detailsData)
      setSourceRates(sourceData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getConversionTrend = () => {
    if (!metrics || metrics.conversionsByMonth.length < 2) return 'neutral'
    const recent = metrics.conversionsByMonth.slice(-2)
    return recent[1].conversionRate > recent[0].conversionRate ? 'up' : 'down'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Unable to load conversion analytics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with timeframe selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Conversion Analytics</h2>
          <p className="text-gray-600">Historical lead performance and success rate tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border">
            {[
              { key: '30d', label: '30 Days' },
              { key: '90d', label: '90 Days' },
              { key: '1y', label: '1 Year' },
              { key: 'all', label: 'All Time' }
            ].map(option => (
              <Button
                key={option.key}
                variant={timeframe === option.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe(option.key as any)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                {option.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            {getConversionTrend() === 'up' ? (
              <TrendingUp className="h-4 w-4 text-gray-600" />
            ) : getConversionTrend() === 'down' ? (
              <TrendingDown className="h-4 w-4 text-gray-600" />
            ) : (
              <Target className="h-4 w-4 text-gray-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <p className="text-xs text-gray-600">
              {metrics.convertedLeads} of {metrics.totalLeads} leads converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Convert</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageTimeToConvert}</div>
            <p className="text-xs text-gray-600">
              days from lead to project
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Project Value</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalProjectValue)}</div>
            <p className="text-xs text-gray-600">
              from {metrics.convertedLeads} converted leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Project Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageProjectValue)}</div>
            <p className="text-xs text-gray-600">
              per converted lead
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="conversions">Recent Conversions</TabsTrigger>
          <TabsTrigger value="insights">Business Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Conversion Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Monthly Conversion Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.conversionsByMonth.slice(-6).map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={month.conversionRate > 15 ? 'default' : 'secondary'}>
                          {month.conversions} conversions
                        </Badge>
                        <div className="text-sm text-gray-600">
                          {month.conversionRate}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Type Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Service Type Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.conversionsByServiceType.map((service, index) => (
                    <div key={service.serviceType} className="flex items-center justify-between">
                      <div className="text-sm font-medium capitalize">
                        {service.serviceType}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={service.conversionRate > 20 ? 'default' : 'secondary'}>
                          {service.conversions} conversions
                        </Badge>
                        <div className="text-sm text-gray-600">
                          {service.conversionRate}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Source Performance</CardTitle>
              <p className="text-sm text-gray-600">
                Conversion rates by lead source for marketing attribution
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sourceRates.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium capitalize">{source.source}</div>
                      <div className="text-sm text-gray-600">
                        {source.leads} total leads
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{source.rate}%</div>
                      <div className="text-sm text-gray-600">
                        {source.conversions} conversions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Lead Conversions</CardTitle>
              <p className="text-sm text-gray-600">
                Latest leads converted to projects with timing and value data
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conversionDetails.map((conversion, index) => (
                  <div key={conversion.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium">{conversion.name}</div>
                      <div className="text-sm text-gray-600">
                        {conversion.email} • {conversion.serviceType}
                      </div>
                      <div className="text-xs text-gray-500">
                        Converted on {formatDate(conversion.convertedAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(conversion.projectValue)}</div>
                      <div className="text-sm text-gray-600">
                        {conversion.projectNumber}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {conversion.daysToConvert} days
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-600">✅ Solution 1 Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Historical Data Preserved</div>
                    <div className="text-sm text-gray-600">
                      All {metrics.totalLeads} leads maintained for analytics
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Conversion Tracking</div>
                    <div className="text-sm text-gray-600">
                      Complete audit trail from lead to project
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Performance Insights</div>
                    <div className="text-sm text-gray-600">
                      Success rate analysis and optimization opportunities
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Revenue Attribution</div>
                    <div className="text-sm text-gray-600">
                      Direct link from marketing to revenue generation
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-600">📊 Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Active Leads</span>
                  <Badge variant="outline">{metrics.activeLeads}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Won Leads</span>
                  <Badge variant="default">{metrics.convertedLeads}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Lost Leads</span>
                  <Badge variant="secondary">{metrics.lostLeads}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate</span>
                  <Badge variant={metrics.conversionRate > 15 ? 'default' : 'secondary'}>
                    {metrics.conversionRate}%
                  </Badge>
                </div>
                <div className="pt-3 border-t">
                  <div className="text-sm text-gray-600">
                    Data-driven decisions enabled by preserving lead history
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
