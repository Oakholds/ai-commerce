import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import EditProductPage from './edit-product-client'

interface Props {
  params: { productsId: string } // Changed from productId to productsId
}

export default async function EditProductServerPage({ params }: Props) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  const product = await prisma.product.findUnique({
    where: { id: params.productsId }, // Changed from productId to productsId
    include: { category: true },
  })

  if (!product) {
    redirect('/admin/products') // fallback if product doesn't exist
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return <EditProductPage product={product} categories={categories} />
}