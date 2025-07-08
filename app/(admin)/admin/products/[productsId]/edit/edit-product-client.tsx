"use client"

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  categoryId: string
  images: string[]
}

interface EditProductPageProps {
  product: Product
  categories: Category[]
}

export default function EditProductPage({ product, categories }: EditProductPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    stock: product.stock.toString(),
    categoryId: product.categoryId,
    images: product.images,
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(product.images)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      setError('Only JPEG, PNG, or WebP images are allowed')
      return
    }

    const maxSize = 5 * 1024 * 1024
    const oversizedFiles = files.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      setError('Each image must be under 5MB')
      return
    }

    // Clear previous previews from uploaded files
    setImagePreviews(prev => prev.slice(0, product.images.length))
    setImageFiles(files)

    // Create new previews
    const newPreviews: string[] = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string)
        if (newPreviews.length === files.length) {
          setImagePreviews(prev => [...prev.slice(0, product.images.length), ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    if (index < product.images.length) {
      // Removing original image
      setImagePreviews(prev => prev.filter((_, i) => i !== index))
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    } else {
      // Removing newly uploaded image
      const newFileIndex = index - product.images.length
      setImageFiles(prev => prev.filter((_, i) => i !== newFileIndex))
      setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.stock || !formData.categoryId) {
      setError('Please fill out all required fields')
      return
    }

    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError('Please enter a valid price')
      return
    }

    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      setError('Please enter a valid stock number')
      return
    }

    startTransition(async () => {
      try {
        const submitData = new FormData()
        submitData.append('name', formData.name.trim())
        submitData.append('description', formData.description.trim())
        submitData.append('price', formData.price)
        submitData.append('stock', formData.stock)
        submitData.append('categoryId', formData.categoryId)

        // Add existing images that weren't removed
        formData.images.forEach((imageUrl, index) => {
          submitData.append(`existingImages[${index}]`, imageUrl)
        })

        // Add new image files
        imageFiles.forEach(file => {
          submitData.append('images', file)
        })

        console.log('Submitting to:', `/api/admin/products/${product.id}`)
        console.log('Form data entries:', Array.from(submitData.entries()))

        const response = await fetch(`/api/admin/products/${product.id}`, {
          method: 'PATCH',
          body: submitData,
        })

        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error response:', errorText)
          
          try {
            const errorData = JSON.parse(errorText)
            throw new Error(errorData.error || 'Failed to update product')
          } catch (parseError) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`)
          }
        }

        const result = await response.json()
        console.log('Success result:', result)

        setSuccess('Product updated successfully!')
        setTimeout(() => router.push(`/admin/products/${product.id}`), 1500)
      } catch (err) {
        console.error('Submit error:', err)
        setError(err instanceof Error ? err.message : 'Failed to update product')
      }
    })
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} disabled={isPending}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Modify existing product details</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isPending}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={isPending}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      disabled={isPending}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      disabled={isPending}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    disabled={isPending}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isPending}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload new images</span>
                    <span className="text-xs text-gray-400">JPEG, PNG, WebP (max 5MB)</span>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Current/Uploaded Images</p>
                    <div className="grid grid-cols-2 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={preview}
                            alt={`Image ${index + 1}`}
                            width={100}
                            height={100}
                            className="w-full h-20 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={isPending}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>Cancel</Button>
          <Button type="submit" disabled={isPending}>{isPending ? 'Updating...' : 'Update Product'}</Button>
        </div>
      </form>
    </div>
  )
}