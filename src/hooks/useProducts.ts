import { useCallback, useEffect, useState } from 'react'
import type { Product } from '../types'

type CmsProductResponse = {
  ok?: boolean
  error?: string
  products?: Array<{
    id: string
    name: string
    price: number
    category?: string
    sortOrder?: number
    updatedAt?: string
  }>
}

function mapCmsProduct(product: NonNullable<CmsProductResponse['products']>[number]): Product {
  const now = product.updatedAt || new Date().toISOString()

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    tag: product.category || undefined,
    active: true,
    sortOrder: Number.isFinite(product.sortOrder) ? Number(product.sortOrder) : 0,
    createdAt: now,
    updatedAt: now,
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/pos-products', {
        headers: {
          Accept: 'application/json',
        },
      })
      const data = await response.json().catch(() => null) as CmsProductResponse | null

      if (!response.ok || !data?.ok || !Array.isArray(data.products)) {
        throw new Error(data?.error || 'POS products could not be loaded.')
      }

      setProducts(data.products.map(mapCmsProduct))
    } catch (loadError) {
      setProducts([])
      setError(loadError instanceof Error ? loadError.message : 'POS products could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { products, loading, error, refresh }
}
