'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Eye,
  Target,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  totalCustomers: number
  customersChange: number
  pageViews: number
  pageViewsChange: number
  conversionRate: number
  conversionChange: number
  avgOrderValue: number
  avgOrderValueChange: number
  returnCustomers: number
  returnCustomersChange: number
  avgSessionDuration: number
  sessionDurationChange: number
}

interface AnalyticsCardsProps {
  data: AnalyticsData
}

export function AnalyticsCards({ data }: AnalyticsCardsProps) {
  const cards = [
    {
      title: 'Total Revenue',
      value: `$${data.totalRevenue.toLocaleString()}`,
      change: data.revenueChange,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: data.totalOrders.toLocaleString(),
      change: data.ordersChange,
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Total Customers',
      value: data.totalCustomers.toLocaleString(),
      change: data.customersChange,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Page Views',
      value: data.pageViews.toLocaleString(),
      change: data.pageViewsChange,
      icon: Eye,
      color: 'text-orange-600',
    },
    {
      title: 'Conversion Rate',
      value: `${data.conversionRate.toFixed(2)}%`,
      change: data.conversionChange,
      icon: Target,
      color: 'text-red-600',
    },
    {
      title: 'Avg Order Value',
      value: `$${data.avgOrderValue.toFixed(2)}`,
      change: data.avgOrderValueChange,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Return Customers',
      value: `${data.returnCustomers.toFixed(1)}%`,
      change: data.returnCustomersChange,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Avg Session Duration',
      value: `${Math.floor(data.avgSessionDuration / 60)}m ${data.avgSessionDuration % 60}s`,
      change: data.sessionDurationChange,
      icon: Clock,
      color: 'text-indigo-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={cn('h-4 w-4', card.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {card.change > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={cn(
                card.change > 0 ? 'text-green-500' : 'text-red-500'
              )}>
                {card.change > 0 ? '+' : ''}{card.change.toFixed(1)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}