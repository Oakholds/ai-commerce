import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ productsId: string }> }) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Await the params before using them
    const { productsId } = await params
    const productId = productsId

    // Validate product exists
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } })
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get form data
    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const categoryId = formData.get('categoryId') as string
    const stock = parseInt(formData.get('stock') as string)
    const imageFiles = formData.getAll('images') as File[]

    // Basic validation
    if (!name || !description || !price || !categoryId || stock < 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate category
    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Upload new images (if any)
    let imageUrls: string[] = existingProduct.images
    if (imageFiles.length > 0) {
      imageUrls = []
      for (const file of imageFiles) {
        if (!file || typeof file.arrayBuffer !== 'function') continue
        const buffer = Buffer.from(await file.arrayBuffer())

        // const fallbackName = `image-${Date.now()}`
        // const fileName = file.name?.split('.')[0] || fallbackName

        const uploadResult = await uploadToCloudinary(buffer, file.name)
        imageUrls.push(uploadResult.secure_url)
      }
    }

    // Update product
    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name.trim(),
        description: description.trim(),
        price,
        categoryId,
        stock,
        images: imageUrls,
      },
    })

    return NextResponse.json({ message: 'Product updated successfully', product: updated })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}