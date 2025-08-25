'use client'


import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer
} from '@paypal/react-paypal-js'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface PaymentFormProps {
  orderId: string
  amount: number
}

function PayPalButtonWrapper({ orderId, amount }: PaymentFormProps) {
  const [{ isPending }] = usePayPalScriptReducer()
  const { toast } = useToast()
  const router = useRouter()

  const createOrder = async () => {
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create PayPal order')
      }

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error('Error creating PayPal order:', error)
      toast({
        title: 'Error',
        description: 'Failed to create payment order',
        variant: 'destructive',
      })
      throw error
    }
  }

  const onApprove = async (data: { orderID: string }) => {
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
          orderId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to capture payment')
      }

      const result = await response.json()
      
      if (result.status === 'COMPLETED') {
        toast({
          title: 'Success',
          description: 'Payment completed successfully!',
        })
        router.push(`/order-confirmation/${orderId}`)
      } else {
        throw new Error('Payment was not completed')
      }
    } catch (error) {
      console.error('Error capturing payment:', error)
      toast({
        title: 'Error',
        description: 'Payment failed. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const onError = (err: Record<string, unknown>) => {
    console.error('PayPal error:', err)
    toast({
      title: 'Payment Error',
      description: 'There was an error processing your payment.',
      variant: 'destructive',
    })
  }

  if (isPending) {
    return <div className="text-center">Loading PayPal...</div>
  }

  return (
    <PayPalButtons
      style={{ 
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
    />
  )
}

export function PaymentForm({ orderId, amount }: PaymentFormProps) {
  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: 'USD',
    intent: 'capture',
  }

  return (
    <div className="space-y-6">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtonWrapper orderId={orderId} amount={amount} />
      </PayPalScriptProvider>
    </div>
  )
}