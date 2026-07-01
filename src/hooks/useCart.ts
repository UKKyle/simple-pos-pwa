import { useMemo, useState } from 'react'
import type { CartItem, Product } from '../types'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addProduct = (product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id)
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  const setQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setItems((current) => current.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId))
  }

  const clearCart = () => setItems([])

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    return { subtotal, total: subtotal, itemCount }
  }, [items])

  return { items, addProduct, setQuantity, removeItem, clearCart, totals }
}
