import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/db'
import type { Product } from '../types'
import { createId } from '../utils/ids'
import { normalizeTag } from '../utils/validation'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setProducts(await db.products.orderBy('name').toArray())
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addProduct = async (name: string, price: number, tag: string) => {
    const existing = await db.products.where('name').equalsIgnoreCase(name.trim()).first()
    if (existing) throw new Error('A product with this name already exists.')
    const now = new Date().toISOString()
    await db.products.add({
      id: createId('product'),
      name: name.trim(),
      price,
      tag: normalizeTag(tag),
      active: true,
      createdAt: now,
      updatedAt: now,
    })
    await refresh()
  }

  const updateProduct = async (id: string, patch: Pick<Product, 'name' | 'price' | 'active' | 'tag'>) => {
    const duplicate = await db.products.where('name').equalsIgnoreCase(patch.name.trim()).first()
    if (duplicate && duplicate.id !== id) throw new Error('A product with this name already exists.')
    await db.products.update(id, {
      ...patch,
      name: patch.name.trim(),
      tag: normalizeTag(patch.tag ?? ''),
      updatedAt: new Date().toISOString(),
    })
    await refresh()
  }

  const deleteProduct = async (id: string) => {
    await db.products.delete(id)
    await refresh()
  }

  return { products, loading, refresh, addProduct, updateProduct, deleteProduct }
}
