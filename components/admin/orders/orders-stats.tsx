'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingCart, 
  Clock, 
  Truck, 
  CheckCircle, 
  DollarSign, 
  TrendingUp,
  Package
} from 'lucide-react'

interface OrdersStatsData {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
  monthlyRevenue: number
  averageOrderValue: number
  totalCustomers: number
  revenueGrowth: number
  ordersGrowth: number
}

interface OrdersStatsProps {
  data: OrdersStatsData
}

export function OrdersStats({ data }: OrdersStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const stats = [
    {
      title: 'Total Orders',
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      description: `${formatPercentage(data.ordersGrowth)} from last month`,
      trend: data.ordersGrowth > 0 ? 'positive' : 'negative'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      description: `${formatPercentage(data.revenueGrowth)} from last month`,
      trend: data.revenueGrowth > 0 ? 'positive' : 'negative'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(data.monthlyRevenue),
      icon: TrendingUp,
      description: 'This month so far',
      trend: 'neutral'
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(data.averageOrderValue),
      icon: Package,
      description: 'Per order',
      trend: 'neutral'
    },
    {
      title: 'Pending Orders',
      value: data.pendingOrders.toLocaleString(),
      icon: Clock,
      description: 'Awaiting processing',
      trend: 'neutral'
    },
    {
      title: 'Processing Orders',
      value: data.processingOrders.toLocaleString(),
      icon: Package,
      description: 'Currently processing',
      trend: 'neutral'
    },
    {
      title: 'Shipped Orders',
      value: data.shippedOrders.toLocaleString(),
      icon: Truck,
      description: 'Out for delivery',
      trend: 'neutral'
    },
    {
      title: 'Delivered Orders',
      value: data.deliveredOrders.toLocaleString(),
      icon: CheckCircle,
      description: 'Successfully delivered',
      trend: 'positive'
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs ${
              stat.trend === 'positive' 
                ? 'text-green-600' 
                : stat.trend === 'negative' 
                ? 'text-red-600' 
                : 'text-muted-foreground'
            }`}>
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}