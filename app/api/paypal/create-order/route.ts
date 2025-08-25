// app/api/paypal/create-order/route.ts
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
    const { orderId, amount } = body

    if (!orderId || !amount) {
      return new NextResponse('Order ID and amount are required', { status: 400 })
    }

    // Get base URL from request
    const url = new URL(req.url)
    const baseUrl = `${url.protocol}//${url.host}`

    // Get the order from database
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    })

    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }

    // If order is already paid, return error
    if (order.stripePaymentId) {
      return new NextResponse('Order is already paid', { status: 400 })
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Calculate amounts from actual items
    const itemTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = 10 // Fixed shipping cost
    const tax = itemTotal * 0.1 // 10% tax
    const total = (itemTotal + shipping + tax).toFixed(2)

    // Create PayPal order
    const paypalOrder = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: total,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: itemTotal.toFixed(2),
              },
              shipping: {
                currency_code: 'USD',
                value: shipping.toFixed(2),
              },
              tax_total: {
                currency_code: 'USD',
                value: tax.toFixed(2),
              },
            },
          },
          items: order.items.map((item) => ({
            name: item.product.name,
            unit_amount: {
              currency_code: 'USD',
              value: item.price.toFixed(2),
            },
            quantity: item.quantity.toString(),
          })),
          description: `Order #${order.id}`,
        },
      ],
      application_context: {
        return_url: `${baseUrl}/order-confirmation/${order.id}`,
        cancel_url: `${baseUrl}/payment/${order.id}`,
        brand_name: 'Your Store Name',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
      },
    }

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paypalOrder),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal order creation failed:', errorData)
      throw new Error('Failed to create PayPal order')
    }

    const paypalOrderData = await response.json()

    // Update order with PayPal order ID
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        stripePaymentId: paypalOrderData.id,
      },
    })

    return NextResponse.json({ id: paypalOrderData.id })
  } catch (error) {
    console.error('[PAYPAL_CREATE_ORDER_ERROR]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}