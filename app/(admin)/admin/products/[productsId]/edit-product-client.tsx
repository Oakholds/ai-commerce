"use client"

import { useState, useTransition } from 'react'
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
  images: string[]
  categoryId: string
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
  })

  const [existingImages, setExistingImages] = useState<string[]>(product.images)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setError('Invalid image type')
        return
      }
      if (file.size > maxSize) {
        setError('Image too large')
        return
      }
    }

    const previews: string[] = []
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        previews.push(e.target?.result as string)
        if (previews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...previews])
        }
      }
      reader.readAsDataURL(file)
    })

    setImageFiles((prev) => [...prev, ...files])
  }

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required'
    if (!formData.description.trim()) return 'Product description is required'
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Valid price is required'
    if (!formData.stock || parseInt(formData.stock) < 0) return 'Valid stock is required'
    if (!formData.categoryId) return 'Category is required'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    startTransition(async () => {
      try {
        const body = new FormData()
        body.append('name', formData.name.trim())
        body.append('description', formData.description.trim())
        body.append('price', formData.price)
        body.append('stock', formData.stock)
        body.append('categoryId', formData.categoryId)
        existingImages.forEach((url) => body.append('existingImages', url))
        imageFiles.forEach((file) => body.append('images', file))

        const res = await fetch(`/api/admin/products/${product.id}`, {
          method: 'PATCH',
          body,
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Update failed')

        setSuccess('Product updated successfully')
        setTimeout(() => router.push(`/admin/products/${product.id}`), 1500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
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
          <p className="text-muted-foreground">Update your product details</p>
        </div>
      </div>

      {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="mb-6"><AlertDescription>{success}</AlertDescription></Alert>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} disabled={isPending} required />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} disabled={isPending} required rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input type="number" id="price" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} disabled={isPending} required />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input type="number" id="stock" value={formData.stock} onChange={(e) => handleInputChange('stock', e.target.value)} disabled={isPending} required />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select id="category" value={formData.categoryId} onChange={(e) => handleInputChange('categoryId', e.target.value)} disabled={isPending} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Images</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={isPending} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="cursor-pointer">Upload Images</label>
            </div>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Existing Images</p>
                <div className="grid grid-cols-2 gap-2">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image src={url} alt="img" width={100} height={100} className="w-full h-20 object-cover rounded-md" />
                      <button type="button" onClick={() => removeExistingImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New image previews */}
            {imagePreviews.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">New Images</p>
                <div className="grid grid-cols-2 gap-2">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative group">
                      <Image src={src} alt="preview" width={100} height={100} className="w-full h-20 object-cover rounded-md" />
                      <button type="button" onClick={() => removeNewImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>Cancel</Button>
          <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  )
}
