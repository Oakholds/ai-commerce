import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
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
  // Add input validation
  const validatedPage = Math.max(1, page)
  const validatedLimit = Math.max(1, Math.min(100, limit)) // Cap at 100
  const skip = (validatedPage - 1) * validatedLimit

  console.log('getOrders called with params:', {
    page: validatedPage,
    limit: validatedLimit,
    search,
    status,
    sort,
    order,
    dateFrom,
    dateTo,
  })

  // Build where clause
  const where: Prisma.OrderWhereInput = {}

  // Search in order ID or customer email/name
  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  // Filter by status - add validation
  if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
    where.status = status as OrderStatus
  }

  // Filter by date range with better error handling
  if (dateFrom || dateTo) {
    where.createdAt = {}
    try {
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        if (isNaN(fromDate.getTime())) {
          console.warn('Invalid dateFrom:', dateFrom)
        } else {
          where.createdAt.gte = fromDate
        }
      }
      if (dateTo) {
        const toDate = new Date(dateTo + 'T23:59:59.999Z')
        if (isNaN(toDate.getTime())) {
          console.warn('Invalid dateTo:', dateTo)
        } else {
          where.createdAt.lte = toDate
        }
      }
    } catch (error) {
      console.error('Error parsing dates:', error)
      // Continue without date filtering if dates are invalid
    }
  }

  // Build orderBy clause with validation
//   const orderBy: OrderBy = {}
const orderBy: Prisma.OrderOrderByWithRelationInput = {}
// const validSortFields = ['createdAt', 'updatedAt', 'total', 'status']
const validOrderValues = ['asc', 'desc']
  
if (validOrderValues.includes(order)) {
  switch (sort) {
    case 'createdAt':
      orderBy.createdAt = order as 'asc' | 'desc'
      break
    case 'updatedAt':
      orderBy.updatedAt = order as 'asc' | 'desc'
      break
    case 'total':
      orderBy.total = order as 'asc' | 'desc'
      break
    case 'status':
      orderBy.status = order as 'asc' | 'desc'
      break
    default:
      orderBy.createdAt = 'desc'
  }
} else {
  orderBy.createdAt = 'desc'
}

//   console.log('Query where clause:', where)
//   console.log('Query orderBy clause:', orderBy)

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
        take: validatedLimit,
      }),
      prisma.order.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / validatedLimit)

    const result = {
      orders,
      totalPages,
      totalCount,
      currentPage: validatedPage,
    }

    console.log('getOrders result:', {
      ordersCount: orders.length,
      totalPages,
      totalCount,
      currentPage: validatedPage,
    })

    // Validate the result structure
    if (!Array.isArray(orders)) {
      console.error('Orders is not an array:', orders)
      throw new Error('Database returned invalid orders data')
    }

    return result
  } catch (error) {
    console.error('Error fetching orders:', error)
    
    // Return a safe fallback instead of throwing
    return {
      orders: [],
      totalPages: 1,
      totalCount: 0,
      currentPage: validatedPage,
    }
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
    
    // Return safe fallback data
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