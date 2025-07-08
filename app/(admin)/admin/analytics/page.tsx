import { getRevenueDataai, getOrderStatsai, getRecentOrdersai } from '@/lib/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AnalyticsPage() {
  const [revenueData, orderStats] = await Promise.all([
    getRevenueDataai(),
    getOrderStatsai(),
    getRecentOrdersai(5),
  ])

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Analytics</h2>
        <p className='text-muted-foreground'>Quick overview of store performance</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>₦{revenueData.total.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{orderStats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivered Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{orderStats.delivered}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{orderStats.pending}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
