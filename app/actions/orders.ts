'use server'

import { OrderStatus } from '@prisma/client'
import { updateOrderStatus } from '@/lib/orders'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    await updateOrderStatus(orderId, status)
    
    // Revalidate the orders page to show updated data
    revalidatePath('/admin/orders')
    
    return { success: true, message: 'Order status updated successfully' }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, message: 'Failed to update order status' }
  }
}