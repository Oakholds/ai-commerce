import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import EditProductPage from './edit-product-client'

interface EditProductPageProps {
  params: Promise<{
    productsId: string
  }>
}

export default async function EditProductServerPage({ params }: EditProductPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  // Await the params before using them
  const { productsId } = await params

  const product = await prisma.product.findUnique({
    where: { id: productsId },
    include: { category: true },
  })

  if (!product) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return <EditProductPage product={product} categories={categories} />
}