import prisma from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export interface GetOrdersParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  sort?: string
  order?: string
  dateFrom?: string
  dateTo?: string
}

export async function getOrders({
  page = 1,
  limit = 20,
  search = '',
  status = '',
  sort = 'createdAt',
  order = 'desc',
  dateFrom = '',
  dateTo = '',
}: GetOrdersParams) {
  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {}

  // Search in order ID or customer email/name
  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  // Filter by status
  if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
    where.status = status as OrderStatus
  }

  // Filter by date range
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom)
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
    }
  }

  // Build orderBy clause
  const orderBy: any = {}
  if (sort === 'createdAt' || sort === 'updatedAt' || sort === 'total') {
    orderBy[sort] = order
  } else if (sort === 'status') {
    orderBy.status = order
  } else {
    orderBy.createdAt = 'desc'
  }

  try {
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          shippingAddress: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return {
      orders,
      totalPages,
      totalCount,
      currentPage: page,
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw new Error('Failed to fetch orders')
  }
}

export async function getOrdersStats() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      lastMonthOrders,
      totalCustomers,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      
      // Orders by status
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      
      // Total revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      
      // Monthly revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: startOfMonth },
        },
      }),
      
      // Last month revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { not: 'CANCELLED' },
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      
      // Last month orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      
      // Total customers
      prisma.user.count(),
    ])

    const totalRevenueAmount = totalRevenue._sum.total || 0
    const monthlyRevenueAmount = monthlyRevenue._sum.total || 0
    const lastMonthRevenueAmount = lastMonthRevenue._sum.total || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenueAmount / totalOrders : 0

    // Calculate growth percentages
    const revenueGrowth = lastMonthRevenueAmount > 0 
      ? ((monthlyRevenueAmount - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100
      : 0

    const thisMonthOrders = await prisma.order.count({
      where: { createdAt: { gte: startOfMonth } },
    })

    const ordersGrowth = lastMonthOrders > 0 
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 0

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenueAmount,
      monthlyRevenue: monthlyRevenueAmount,
      averageOrderValue,
      totalCustomers,
      revenueGrowth,
      ordersGrowth,
    }
  } catch (error) {
    console.error('Error fetching orders stats:', error)
    throw new Error('Failed to fetch orders stats')
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    throw new Error('Failed to update order status')
  }
}