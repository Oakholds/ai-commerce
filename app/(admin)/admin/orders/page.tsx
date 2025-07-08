import { Suspense } from 'react'
import Link from 'next/link'
import { Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrdersTable } from '@/components/admin/orders/orders-table'
import { OrdersFiltersWrapper } from '@/components/admin/orders/orders-filters-wrapper'
import { SearchForm } from '@/components/admin/orders/search-form'
import { OrdersStats } from '@/components/admin/orders/orders-stats'
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
    }),
    getOrdersStats(),
  ])

  // Extract orders array and pagination data from the result
  const { orders, totalPages, totalCount, currentPage } = ordersResult

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
}