import { redirect } from 'next/navigation'
import { auth } from '@/auth'
// import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import NewProductPage from './new-product-client'

export default async function NewProductServerPage() {
  // Check authentication and admin role
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  // Fetch categories for the form
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return <NewProductPage categories={categories} />
}