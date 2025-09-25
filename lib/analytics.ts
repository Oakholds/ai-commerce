import prisma from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import { startOfDay, subDays, format } from 'date-fns'

export async function getRevenueData(days: number = 30) {
  const endDate = startOfDay(new Date())
  const startDate = subDays(endDate, days)

  const orders = await prisma.order.findMany({
    where: {
      status: OrderStatus.DELIVERED,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Group orders by date and calculate daily revenue
  const dailyRevenue = orders.reduce((acc, order) => {
    const date = format(order.createdAt, 'MMM d')
    acc[date] = (acc[date] || 0) + order.total
    return acc
  }, {} as Record<string, number>)

  // Convert to array format for Recharts
  const data = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue,
  }))

  return data
}


export async function getOrderStats() {
  const endDate = new Date()
  const startDate = subDays(endDate, 30)

  const orderStats = await prisma.order.groupBy({
    by: ['status'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
  })

  return orderStats.map((stat) => ({
    name: stat.status,
    value: stat._count,
  }))
}

export async function getRecentOrders(limit: number = 5) {
  const orders = await prisma.order.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      guestName: true,    // Add this
      guestEmail: true,   // Add this
      user: {
        select: {
          id: true,       // Add this if needed
          name: true,
          email: true,    // Add this if needed
        },
      },
    },
  })

  return orders
}

export async function getRevenueDataai() {
  const orders = await prisma.order.findMany({ where: { status: 'DELIVERED' } })
  const total = orders.reduce((sum, order) => sum + order.total, 0)
  return { total }
}

export async function getOrderStatsai() {
  const total = await prisma.order.count()
  const delivered = await prisma.order.count({ where: { status: 'DELIVERED' } })
  const pending = await prisma.order.count({ where: { status: 'PENDING' } })
  return { total, delivered, pending }
}

export async function getRecentOrdersai(limit = 5) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  })
}
