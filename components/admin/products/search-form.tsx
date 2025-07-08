'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'

interface SearchFormProps {
  defaultValue?: string
}

export function SearchForm({ defaultValue = '' }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = (formData: FormData) => {
    const searchValue = formData.get('search') as string
    const params = new URLSearchParams(searchParams)
    
    if (searchValue) {
      params.set('search', searchValue)
    } else {
      params.delete('search')
    }
    
    // Reset to first page when searching
    params.set('page', '1')
    
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  return (
    <form action={handleSearch} className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="search"
        placeholder="Search products..."
        className="pl-10"
        defaultValue={defaultValue}
        disabled={isPending}
      />
    </form>
  )
}