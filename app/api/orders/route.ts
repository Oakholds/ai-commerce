import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

interface CartItem {
  id: string
  productId: string
  quantity: number
  price: number
}

interface ShippingInfo {
  fullName: string  // Added this since your form has it
  email: string     // Added this since your form has it
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface OrderBody {
  items: CartItem[]
  shippingInfo: ShippingInfo
  total: number
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const body = await req.json()
    const { items, shippingInfo, total } = body as OrderBody

    if (!items?.length) {
      return new NextResponse('Bad Request: Cart items are required', {
        status: 400,
      })
    }

    if (!shippingInfo) {
      return new NextResponse('Bad Request: Shipping information is required', {
        status: 400,
      })
    }

    // For guest orders, require email
    if (!session?.user?.id && !shippingInfo.email) {
      return new NextResponse('Bad Request: Email is required for guest orders', {
        status: 400,
      })
    }

    // Verify all products exist and are in stock
    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    })

    // Check if all products exist
    if (products.length !== items.length) {
      const foundProductIds = products.map((p) => p.id)
      const missingProductIds = productIds.filter(
        (id) => !foundProductIds.includes(id)
      )
      return new NextResponse(
        `Products not found: ${missingProductIds.join(', ')}`,
        {
          status: 400,
        }
      )
    }

    // Check stock levels
    const insufficientStock = items.filter((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product && product.stock < item.quantity
    })

    if (insufficientStock.length > 0) {
      return new NextResponse(
        `Insufficient stock for products: ${insufficientStock
          .map((item) => item.productId)
          .join(', ')}`,
        { status: 400 }
      )
    }

    // Create shipping address (for both guest and logged-in users)

    
    const addressData = {
      street: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      postalCode: shippingInfo.zipCode,
      country: shippingInfo.country,
      // Only connect to user if they're logged in
      ...(session?.user?.id && {
        user: {
          connect: {
            id: session.user.id,
          },
        },
      }),
    }

        console.log('Creating address with:', addressData)
    const address = await prisma.address.create({
      data: addressData,
    })
    console.log('Address created:', address.id)


    // Start a transaction to ensure all operations succeed or fail together
const orderData = {
      addressId: address.id,
      total,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      ...(session?.user?.id 
        ? { userId: session.user.id }
        : { 
            guestEmail: shippingInfo.email,
            guestName: shippingInfo.fullName 
          }
      ),
    }
    
    console.log('Creating order with:', JSON.stringify(orderData, null, 2))

    const order = await prisma.$transaction(async (tx) => {

      // Create order with items
      const orderData = {
        addressId: address.id,
        total,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        // Add user ID if logged in, guest info if not
        ...(session?.user?.id 
          ? { userId: session.user.id }
          : { 
              guestEmail: shippingInfo.email,
              guestName: shippingInfo.fullName 
            }
        ),
      }

      const newOrder = await tx.order.create({
        data: orderData,
        include: {
          items: true,
          shippingAddress: true,
        },
      })

      // Update product stock levels
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Clear the user's cart if they're logged in and have a cart
      if (session?.user?.id) {
        await tx.cart
          .delete({
            where: { userId: session.user.id },
          })
          .catch(() => {
            // Ignore error if cart doesn't exist
          })
      }

      return newOrder
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
  if (error === null || error === undefined) {
    console.error('[ORDERS_POST] Caught null/undefined error')
    return new NextResponse('Internal error - null exception', { status: 500 })
  }
  
  console.error('[ORDERS_POST] Error:', error)
  console.error('[ORDERS_POST] Error type:', typeof error)
  
  if (error instanceof Error) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 })
  }
  return new NextResponse('Internal error', { status: 500 })
}
}