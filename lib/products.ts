import prisma from '@/lib/prisma'
// import { Product } from '@prisma/client'
import { startOfDay, subDays, format } from 'date-fns'

interface GetProductsParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: string
  sort?: string
  order?: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  stock: number
  category: {
    id: string
    name: string
  }
  createdAt: Date
  updatedAt: Date
}

interface ProductsResult {
  products: Product[]
  totalPages: number
  totalCount: number
}

export interface ProductsStatsData {
  totalProducts: number
  totalValue: number
  lowStock: number
  outOfStock: number
  averagePrice: number
  categoriesCount: number
  recentProducts: number // products added in last 30 days
}

interface GetProductsParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: string
  sort?: string
  order?: string
}

export async function getProducts({
  page = 1,
  limit = 20,
  search = '',
  category = '',
  status = '',
  sort = 'createdAt',
  order = 'desc',
}: GetProductsParams) {
  const where: any = {}

  // Search by name or description
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Category filter
  if (category) {
    where.category = {
      name: { equals: category, mode: 'insensitive' },
    }
  }

  // Status filter
  if (status === 'out-of-stock') {
    where.stock = 0
  } else if (status === 'low-stock') {
    where.stock = { lte: 10, gt: 0 }
  } else if (status === 'in-stock') {
    where.stock = { gt: 10 }
  }

  const totalCount = await prisma.product.count({ where })

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: {
      [sort]: order,
    },
    skip: (page - 1) * limit,
    take: limit,
  })

  return {
    products,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  }
}

export async function getProductsStats(): Promise<ProductsStatsData> {
  try {
    // Get all products with their basic info
    const products = await prisma.product.findMany({
      select: {
        id: true,
        price: true,
        stock: true,
        createdAt: true,
        categoryId: true,
      },
    })

    // Calculate total products
    const totalProducts = products.length

    // Calculate total inventory value (price * stock for each product)
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.price * product.stock)
    }, 0)

    // Calculate low stock items (stock <= 10)
    const lowStock = products.filter(product => product.stock > 0 && product.stock <= 10).length

    // Calculate out of stock items
    const outOfStock = products.filter(product => product.stock === 0).length

    // Calculate average price
    const averagePrice = totalProducts > 0 ? products.reduce((sum, product) => sum + product.price, 0) / totalProducts : 0

    // Get unique categories count
    const uniqueCategories = new Set(products.map(product => product.categoryId))
    const categoriesCount = uniqueCategories.size

    // Calculate recent products (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentProducts = products.filter(product => product.createdAt >= thirtyDaysAgo).length

    return {
      totalProducts,
      totalValue,
      lowStock,
      outOfStock,
      averagePrice,
      categoriesCount,
      recentProducts,
    }
  } catch (error) {
    console.error('Error fetching products stats:', error)
    // Return default values in case of error
    return {
      totalProducts: 0,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0,
      averagePrice: 0,
      categoriesCount: 0,
      recentProducts: 0,
    }
  }
}

// Alternative optimized version using Prisma aggregations
export async function getProductsStatsOptimized(): Promise<ProductsStatsData> {
  try {
    const [
      totalProducts,
      totalValueResult,
      lowStockCount,
      outOfStockCount,
      averagePriceResult,
      categoriesCount,
      recentProductsCount,
    ] = await Promise.all([
      // Total products count
      prisma.product.count(),
      
      // Total value calculation
      prisma.product.aggregate({
        _sum: {
          price: true,
        },
        where: {
          stock: {
            gt: 0,
          },
        },
      }),
      
      // Low stock count (stock between 1-10)
      prisma.product.count({
        where: {
          stock: {
            gt: 0,
            lte: 10,
          },
        },
      }),
      
      // Out of stock count
      prisma.product.count({
        where: {
          stock: 0,
        },
      }),
      
      // Average price
      prisma.product.aggregate({
        _avg: {
          price: true,
        },
      }),
      
      // Categories count
      prisma.product.groupBy({
        by: ['categoryId'],
        _count: {
          categoryId: true,
        },
      }),
      
      // Recent products (last 30 days)
      prisma.product.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    // Calculate actual total value (we need individual calculations for this)
    const productsForValue = await prisma.product.findMany({
      select: {
        price: true,
        stock: true,
      },
    })
    
    const totalValue = productsForValue.reduce((sum, product) => {
      return sum + (product.price * product.stock)
    }, 0)

    return {
      totalProducts,
      totalValue,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      averagePrice: averagePriceResult._avg.price || 0,
      categoriesCount: categoriesCount.length,
      recentProducts: recentProductsCount,
    }
  } catch (error) {
    console.error('Error fetching optimized products stats:', error)
    return {
      totalProducts: 0,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0,
      averagePrice: 0,
      categoriesCount: 0,
      recentProducts: 0,
    }
  }
}