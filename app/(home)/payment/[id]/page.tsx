// app/(home)/payment/[id]/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { PaymentForm } from '@/components/checkout/payment-form'
import { OrderSummary } from '@/components/checkout/order-summary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type tParams = Promise<{ id: string }>

interface PageProps {
  params: tParams
}

export default async function PaymentPage({ params }: PageProps) {
  const session = await auth()
  const { id } = await params

  const order = await prisma.order.findFirst({
    where: {
      id: id,
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
    redirect('/')
  }

  // FIXED: Check payment status instead of just stripePaymentId
  if (order.paymentStatus === 'COMPLETED') {
    redirect(`/order-confirmation/${order.id}`)
  }

  const subtotal = order.total
  const shipping = 10
  const tax = subtotal * 0.1
  const finalAmount = subtotal + shipping + tax

  return (
    <div className='container max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-3xl font-bold mb-10'>Payment</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentForm orderId={id} amount={finalAmount} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderSummary/>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
