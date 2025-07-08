'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'
import { useTransition } from 'react'

interface ProductsFiltersProps {
  currentCategory: string
  currentStatus: string
  currentSort: string
  currentOrder: string
  categories: { id: string; name: string }[]
}

export function ProductsFilters({
  currentCategory,
  currentStatus,
  currentSort,
  currentOrder,
  categories,
}: ProductsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Apply all updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    params.set('page', '1') // Reset to first page
    
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const updateSingleFilter = (key: string, value: string) => {
    updateFilters({ [key]: value })
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    const search = searchParams.get('search')
    if (search) params.set('search', search)
    
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const hasActiveFilters =
    currentCategory || currentStatus || currentSort !== 'createdAt' || currentOrder !== 'desc'

  return (
    <div className="flex items-center space-x-2">
      <Filter className="h-4 w-4 text-muted-foreground" />

      <select
        value={currentCategory}
        onChange={(e) => updateSingleFilter('category', e.target.value)}
        disabled={isPending}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={currentStatus}
        onChange={(e) => updateSingleFilter('status', e.target.value)}
        disabled={isPending}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
      >
        <option value="">All Status</option>
        <option value="in-stock">In Stock</option>
        <option value="low-stock">Low Stock</option>
        <option value="out-of-stock">Out of Stock</option>
      </select>

      <select
        value={`${currentSort}-${currentOrder}`}
        onChange={(e) => {
          const [sort, order] = e.target.value.split('-')
          // Update both sort and order together
          updateFilters({ sort, order })
        }}
        disabled={isPending}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
      >
        <option value="createdAt-desc">Newest First</option>
        <option value="createdAt-asc">Oldest First</option>
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
        <option value="price-asc">Price Low-High</option>
        <option value="price-desc">Price High-Low</option>
        <option value="stock-asc">Stock Low-High</option>
        <option value="stock-desc">Stock High-Low</option>
      </select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          disabled={isPending}
          className="h-8 px-2 lg:px-3"
        >
          Clear
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}