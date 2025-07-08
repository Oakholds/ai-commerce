'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductsStats } from './products.stats'

interface ProductsStatsData {
  totalProducts: number
  totalValue: number
  lowStock: number
  outOfStock: number
  averagePrice?: number
  categoriesCount?: number
  recentProducts?: number
}

interface ProductsStatsWrapperProps {
  initialData: ProductsStatsData
}

export function ProductsStatsWrapper({ initialData }: ProductsStatsWrapperProps) {
  const [data, setData] = useState<ProductsStatsData>(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const refreshStats = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin/stats/products', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Product Statistics</h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {formatTime(lastUpdated)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshStats}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <ProductsStats data={data} />
    </div>
  )
}