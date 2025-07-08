import { ProductsFilters } from './products-filters'
import prisma from '@/lib/prisma'

interface ProductsFiltersWrapperProps {
  currentCategory: string
  currentStatus: string
  currentSort: string
  currentOrder: string
}

export async function ProductsFiltersWrapper({
  currentCategory,
  currentStatus,
  currentSort,
  currentOrder,
}: ProductsFiltersWrapperProps) {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
    },
  })

  return (
    <ProductsFilters
      currentCategory={currentCategory}
      currentStatus={currentStatus}
      currentSort={currentSort}
      currentOrder={currentOrder}
      categories={categories}
    />
  )
}
