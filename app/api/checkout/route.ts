// app/api/checkout/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

interface CheckoutItem {
  id: string
  name: string
  price: number
  quantity: number
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const body = await req.json()
    const { items, shippingAddress, guestInfo } = body

    if (!items?.length || !shippingAddress) {
      return new NextResponse('Bad request', { status: 400 })
    }

    // For guest orders, we need at least email for order confirmation
    if (!session?.user && !guestInfo?.email) {
      return new NextResponse('Email required for guest orders', { status: 400 })
    }

    // Calculate subtotal
    const subtotal = items.reduce(
      (total: number, item: CheckoutItem) => total + item.price * item.quantity,
      0
    )

   

    const order = await prisma.order.create({
      data: {
      status: 'PENDING',
      total: subtotal,
      addressId: shippingAddress.id,
      items: {
        create: items.map((item: CheckoutItem) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      // Add user ID if logged in, otherwise store guest info
      ...(session?.user 
        ? { userId: session.user.id }
        : { 
            guestEmail: guestInfo.email,
            guestName: guestInfo.name || null 
          }
      )
    },
    })

    // Calculate final amount including tax and shipping
    const shipping = 10 // Fixed shipping cost
    const tax = subtotal * 0.1 // 10% tax
    const finalAmount = subtotal + shipping + tax

    return NextResponse.json({
      orderId: order.id,
      amount: finalAmount,
    })
  } catch (error) {
    console.error('[CHECKOUT_ERROR]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}