'use client'

import { useState, useEffect } from 'react'
import { OrdersStats } from './orders-stats'
import { getOrdersStats } from '@/lib/orders'

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

interface OrdersStatsWrapperProps {
  initialData: OrdersStatsData
}

export function OrdersStatsWrapper({ initialData }: OrdersStatsWrapperProps) {
  const [data, setData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)

  // Optional: Add refresh functionality
  const refreshStats = async () => {
    setIsLoading(true)
    try {
      const newData = await getOrdersStats()
      setData(newData)
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Optional: Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshStats, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Refreshing stats...</div>
        </div>
      )}
      <OrdersStats data={data} />
    </div>
  )
}