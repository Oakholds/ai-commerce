// app/api/paypal/capture-order/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token')
  }

  const data = await response.json()
  return data.access_token
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { orderID, orderId } = body

    if (!orderID || !orderId) {
      return new NextResponse('PayPal Order ID and Order ID are required', { status: 400 })
    }

    // Get the order from database
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    })

    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Capture the PayPal order
    const response = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal capture failed:', errorData)
      throw new Error('Failed to capture PayPal payment')
    }

    const captureData = await response.json()

    // Check if payment was successful
    if (captureData.status === 'COMPLETED') {
      // Update order status in database
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: 'PROCESSING',
          stripePaymentId: captureData.purchase_units[0].payments.captures[0].id,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        status: 'COMPLETED',
        captureId: captureData.purchase_units[0].payments.captures[0].id,
      })
    } else {
      throw new Error(`Payment capture failed with status: ${captureData.status}`)
    }
  } catch (error) {
    console.error('[PAYPAL_CAPTURE_ORDER_ERROR]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}