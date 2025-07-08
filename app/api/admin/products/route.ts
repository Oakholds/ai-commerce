import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
import { auth } from '@/auth'
import cloudinary from '@/lib/cloudinary'
// import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
  const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const categoryId = formData.get('categoryId') as string
    const stock = parseInt(formData.get('stock') as string)
    const imageFiles = formData.getAll('images') as File[]

    // Validate required fields
    if (!name || !description || !price || !categoryId || stock < 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      )
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Process images (you'll need to implement your image upload logic here)
    // This is a placeholder - replace with your actual image upload service
    const imageUrls: string[] = []
    
    for (const file of imageFiles) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: 'products',
    })

    imageUrls.push(uploaded.secure_url)
    }

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price,
        categoryId,
        stock,
        images: imageUrls,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(
      { 
        message: 'Product created successfully',
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          images: product.images,
          category: product.category,
          createdAt: product.createdAt,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}