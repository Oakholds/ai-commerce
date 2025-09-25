// app/api/paypal/capture-order/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const PAYPAL_BASE_URL = 'https://api.paypal.com'

async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  
  console.log('Client ID length:', clientId?.length || 0)
  console.log('Client Secret length:', clientSecret?.length || 0)
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })

  console.log('PayPal response status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.log('PayPal error response:', errorText)
    throw new Error(`PayPal auth failed: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  return data.access_token
}
export async function POST(req: Request) {
  try {
    const session = await auth()
    const body = await req.json()
    const { orderID, orderId } = body

    if (!orderID || !orderId) {
      return new NextResponse('PayPal Order ID and Order ID are required', { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          { userId: session?.user?.id || '' },
          { userId: null, guestEmail: { not: null } }
        ]
      }
    })

    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }

    // FIXED: Check if payment is already completed
    if (order.paymentStatus === 'COMPLETED') {
      return NextResponse.json({ 
        status: 'COMPLETED',
        message: 'Order already paid'
      })
    }

    const accessToken = await getPayPalAccessToken()

    const captureResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json()
      console.error('PayPal capture failed:', errorData)
      
      // Update payment status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      })
      
      throw new Error('Failed to capture PayPal payment')
    }

    const captureData = await captureResponse.json()

    // FIXED: Only update status when payment is actually completed
    if (captureData.status === 'COMPLETED') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'COMPLETED', // Mark as completed
          stripePaymentId: captureData.id, // Store PayPal payment ID for reference
        },
      })

      return NextResponse.json({ 
        status: 'COMPLETED',
        captureId: captureData.id 
      })
    }

    // If not completed, update status accordingly
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: captureData.status === 'PENDING' ? 'PROCESSING' : 'FAILED',
      },
    })

    return NextResponse.json({ 
      status: captureData.status,
      message: 'Payment not completed' 
    })

  } catch (error) {
    console.error('[PAYPAL_CAPTURE_ERROR]', error)
    
    // Try to update order status to failed if possible
    try {
      const body = await req.json()
      await prisma.order.update({
        where: { id: body.orderId },
        data: { paymentStatus: 'FAILED' },
      })
    } catch (updateError) {
      console.error('Failed to update order status to failed:', updateError)
    }
    
    return new NextResponse('Internal error', { status: 500 })
  }
}