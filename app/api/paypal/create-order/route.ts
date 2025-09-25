// app/api/paypal/create-order/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const PAYPAL_BASE_URL = 'https://api.paypal.com' 


// async function getPayPalAccessToken() {
//   const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       Authorization: `Basic ${Buffer.from(
//         `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
//       ).toString('base64')}`,
//     },
//     body: 'grant_type=client_credentials',
//   })

//   if (!response.ok) {
//     throw new Error('Failed to get PayPal access token')
//   }

//   const data = await response.json()
//   return data.access_token
// }

async function getPayPalAccessToken() {
  console.log('=== PayPal Auth Debug ===')
  console.log('Client ID first 10 chars:', process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.substring(0, 10))
  console.log('Secret first 10 chars:', process.env.PAYPAL_CLIENT_SECRET?.substring(0, 10))
  
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

  console.log('PayPal auth response status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.log('PayPal auth error response:', errorText)
    throw new Error(`PayPal auth failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const body = await req.json()
    const { orderId, amount } = body

    if (!orderId || !amount) {
      return new NextResponse('Order ID and amount are required', { status: 400 })
    }

    const url = new URL(req.url)
    const baseUrl = `${url.protocol}//${url.host}`

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          { userId: session?.user?.id || '' },
          { userId: null, guestEmail: { not: null } }
        ]
      },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
      },
    })

    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }

    // FIXED: Check payment status instead of stripePaymentId
    if (order.paymentStatus === 'COMPLETED') {
      return new NextResponse('Order is already paid', { status: 400 })
    }

    const accessToken = await getPayPalAccessToken()

    const itemTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = 10
    const tax = itemTotal * 0.1
    const total = (itemTotal + shipping + tax).toFixed(2)

    const paypalOrder = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'GBP',
            value: total,
            breakdown: {
              item_total: { currency_code: 'GBP', value: itemTotal.toFixed(2) },
              shipping: { currency_code: 'GBP', value: shipping.toFixed(2) },
              tax_total: { currency_code: 'GBP', value: tax.toFixed(2) },
            },
          },
          items: order.items.map((item) => ({
            name: item.product.name,
            unit_amount: { currency_code: 'GBP', value: item.price.toFixed(2) },
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

    // FIXED: Store PayPal order ID separately, don't update payment status yet
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paypalOrderId: paypalOrderData.id, // Store PayPal order ID separately
        paymentStatus: 'PENDING' // Keep as pending until captured
      },
    })

    return NextResponse.json({ id: paypalOrderData.id })
  } catch (error) {
    console.error('[PAYPAL_CREATE_ORDER_ERROR]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
