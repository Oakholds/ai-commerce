import { Suspense } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrdersTable } from '@/components/admin/orders/orders-table'
import { OrdersFiltersWrapper } from '@/components/admin/orders/orders-filters-wrapper'
import { SearchForm } from '@/components/admin/orders/search-form'
import { getOrders, getOrdersStats } from '@/lib/orders'
import { OrdersStatsWrapper } from '@/components/admin/orders/orders-stats-wrapper'

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    status?: string
    sort?: string
    order?: string
    dateFrom?: string
    dateTo?: string
  }>
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  // Await searchParams before accessing its properties
  const resolvedSearchParams = await searchParams
  
  const page = parseInt(resolvedSearchParams.page || '1')
  const limit = parseInt(resolvedSearchParams.limit || '20')
  const search = resolvedSearchParams.search || ''
  const status = resolvedSearchParams.status || ''
  const sort = resolvedSearchParams.sort || 'createdAt'
  const order = resolvedSearchParams.order || 'desc'
  const dateFrom = resolvedSearchParams.dateFrom || ''
  const dateTo = resolvedSearchParams.dateTo || ''

  try {
    // Destructure the orders result to get both orders array and pagination data
    const [ordersResult, ordersStats] = await Promise.all([
      getOrders({
        page,
        limit,
        search,
        status,
        sort,
        order,
        dateFrom,
        dateTo,
      }).catch(error => {
        console.error('getOrders failed:', error)
        // Return fallback data if getOrders fails
        return {
          orders: [],
          totalPages: 1,
          totalCount: 0,
          currentPage: page,
        }
      }),
      getOrdersStats().catch(error => {
        console.error('getOrdersStats failed:', error)
        // Return fallback stats if getOrdersStats fails
        return {
          totalOrders: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          averageOrderValue: 0,
          totalCustomers: 0,
          revenueGrowth: 0,
          ordersGrowth: 0,
        }
      }),
    ])

    // Add logging to debug what getOrders returns
    console.log('Orders result:', ordersResult)
    console.log('Type of ordersResult:', typeof ordersResult)
    console.log('Is ordersResult an array?', Array.isArray(ordersResult))

    // Extract orders array and pagination data from the result
    // Add default values to prevent errors
    const { 
      orders = [], 
      totalPages = 1, 
      totalCount = 0, 
      currentPage = 1 
    } = ordersResult || {}

    // Additional safety check
    if (!Array.isArray(orders)) {
      console.error('Orders is not an array:', orders)
      console.error('Full ordersResult:', ordersResult)
      throw new Error('Invalid orders data format')
    }

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">
              Manage customer orders and fulfillment
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
          </div>
        </div>

        {/* Orders Statistics */}
        <Suspense fallback={<div>Loading stats...</div>}>
          <OrdersStatsWrapper initialData={ordersStats} />
        </Suspense>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <SearchForm defaultValue={search} />

          <OrdersFiltersWrapper 
            currentStatus={status}
            currentSort={sort}
            currentOrder={order}
            currentDateFrom={dateFrom}
            currentDateTo={dateTo}
          />
        </div>

        {/* Orders Table */}
        <div className="rounded-md border">
          <Suspense fallback={<div>Loading orders...</div>}>
            <OrdersTable 
              orders={orders}
              totalPages={totalPages}
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={limit}
            />
          </Suspense>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in OrdersPage:', error)
    
    // Return error state
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">
              Manage customer orders and fulfillment
            </p>
          </div>
        </div>

        <div className="rounded-md border p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Error Loading Orders
            </h3>
            <p className="text-muted-foreground">
              There was an error loading the orders. Please check the console for details.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    )
  }
}