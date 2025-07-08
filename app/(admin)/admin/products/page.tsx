import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductsTable } from '@/components/admin/products/products-table'
import { ProductsFiltersWrapper } from '@/components/admin/products/products-filters-wrapper'
import { SearchForm } from '@/components/admin/products/search-form'

import { ProductsStats } from '@/components/admin/products/products.stats'
import { getProducts, getProductsStats } from '@/lib/products'
import { ProductsStatsWrapper } from '@/components/admin/products/products.stats-wrapper'

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
    status?: string
    sort?: string
    order?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Await searchParams before accessing its properties
  const resolvedSearchParams = await searchParams
  
  const page = parseInt(resolvedSearchParams.page || '1')
  const search = resolvedSearchParams.search || ''
  const category = resolvedSearchParams.category || ''
  const status = resolvedSearchParams.status || ''
  const sort = resolvedSearchParams.sort || 'createdAt'
  const order = resolvedSearchParams.order || 'desc'

  const [products, productsStats] = await Promise.all([
    getProducts({
      page,
      limit: 20,
      search,
      category,
      status,
      sort,
      order,
    }),
    getProductsStats(),
  ])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory and catalog
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Products Statistics */}
      <Suspense fallback={<div>Loading stats...</div>}>
        {/* <ProductsStats data={productsStats} /> */}
        <ProductsStatsWrapper initialData={productsStats} />
      </Suspense>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <SearchForm defaultValue={search} />

        <ProductsFiltersWrapper 
          currentCategory={category}
          currentStatus={status}
          currentSort={sort}
          currentOrder={order}
        />
      </div>

      {/* Products Table */}
      <div className="rounded-md border">
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductsTable 
            products={products.products}
            totalPages={products.totalPages}
            currentPage={page}
          />
        </Suspense>
      </div>
    </div>
  )
}