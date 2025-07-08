'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, SortAsc, SortDesc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface OrdersFiltersWrapperProps {
  currentStatus: string
  currentSort: string
  currentOrder: string
  currentDateFrom: string
  currentDateTo: string
}

export function OrdersFiltersWrapper({
  currentStatus,
  currentSort,
  currentOrder,
  currentDateFrom,
  currentDateTo,
}: OrdersFiltersWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Reset to page 1 when filters change
    params.delete('page')
    
    router.push(`/admin/orders?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('status')
    params.delete('dateFrom')
    params.delete('dateTo')
    params.delete('page')
    
    router.push(`/admin/orders?${params.toString()}`)
  }

  const hasActiveFilters = currentStatus || currentDateFrom || currentDateTo

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Label htmlFor="status-filter" className="text-sm font-medium">
          Status:
        </Label>
        <Select
          value={currentStatus}
          onValueChange={(value) => updateFilters({ status: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-fit">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
            {(currentDateFrom || currentDateTo) && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                {currentDateFrom && currentDateTo
                  ? `${currentDateFrom} - ${currentDateTo}`
                  : currentDateFrom || currentDateTo}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-from">From</Label>
              <Input
                id="date-from"
                type="date"
                value={currentDateFrom}
                onChange={(e) => updateFilters({ dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">To</Label>
              <Input
                id="date-to"
                type="date"
                value={currentDateTo}
                onChange={(e) => updateFilters({ dateTo: e.target.value })}
              />
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ dateFrom: '', dateTo: '' })}
              >
                Clear Dates
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort Options */}
      <div className="flex items-center gap-2">
        <Label htmlFor="sort-filter" className="text-sm font-medium">
          Sort:
        </Label>
        <Select
          value={currentSort}
          onValueChange={(value) => updateFilters({ sort: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="updatedAt">Last Updated</SelectItem>
            <SelectItem value="total">Order Total</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateFilters({ order: currentOrder === 'asc' ? 'desc' : 'asc' })}
        >
          {currentOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}