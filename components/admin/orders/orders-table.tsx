'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, MoreHorizontal, Edit, Truck, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrdersPagination } from '@/components/admin/orders/orders-pagination'
import { updateOrderStatusAction } from '@/app/actions/orders' // You'll need to create this file
import { toast } from 'sonner'

interface Order {
  id: string
  user: {
    id: string
    name: string | null
    email: string
  }
  items: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
    }
  }[]
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  shippingAddress: {
    id: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  total: number
  stripePaymentId: string | null
  createdAt: Date // Changed from string to Date
  updatedAt: Date // Changed from string to Date
}

interface OrdersTableProps {
  orders: Order[]
  totalPages: number
  currentPage: number
  totalCount?: number
  pageSize?: number
}

const statusConfig = {
  PENDING: {
    label: 'Pending',
    variant: 'secondary' as const,
    color: 'bg-yellow-100 text-yellow-800',
  },
  PROCESSING: {
    label: 'Processing',
    variant: 'default' as const,
    color: 'bg-blue-100 text-blue-800',
  },
  SHIPPED: {
    label: 'Shipped',
    variant: 'outline' as const,
    color: 'bg-purple-100 text-purple-800',
  },
  DELIVERED: {
    label: 'Delivered',
    variant: 'default' as const,
    color: 'bg-green-100 text-green-800',
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'destructive' as const,
    color: 'bg-red-100 text-red-800',
  },
}

export function OrdersTable({ orders, totalPages, currentPage, totalCount, pageSize = 20 }: OrdersTableProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setIsUpdating(orderId)
    try {
      const result = await updateOrderStatusAction(orderId, newStatus)
      
      if (result.success) {
        toast.success(result.message)
        // The page will automatically revalidate due to revalidatePath in the server action
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to update order status')
    } finally {
      setIsUpdating(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getItemsPreview = (items: Order['items']) => {
    if (items.length === 1) {
      return `${items[0].quantity}x ${items[0].product.name}`
    }
    return `${items.length} items`
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  #{order.id.slice(-8)}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{order.user.name || 'N/A'}</span>
                  <span className="text-sm text-muted-foreground">
                    {order.user.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{getItemsPreview(order.items)}</span>
                  <span className="text-sm text-muted-foreground">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} total items
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={statusConfig[order.status].color}>
                  {statusConfig[order.status].label}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(order.createdAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                    {order.status === 'PENDING' && (
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                        disabled={isUpdating === order.id}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Mark as Processing
                      </DropdownMenuItem>
                    )}
                    {order.status === 'PROCESSING' && (
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                        disabled={isUpdating === order.id}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Mark as Shipped
                      </DropdownMenuItem>
                    )}
                    {order.status === 'SHIPPED' && (
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                        disabled={isUpdating === order.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Delivered
                      </DropdownMenuItem>
                    )}
                    {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                        disabled={isUpdating === order.id}
                        className="text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <OrdersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
        />
      )}
    </div>
  )
}