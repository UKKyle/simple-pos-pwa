import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/db'
import type { Order, PaymentMethod } from '../types'
import { createId, nextOrderNumber } from '../utils/ids'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const all = await db.orders.orderBy('createdAt').reverse().toArray()
    setOrders(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createOrder = async (data: Omit<Order, 'id' | 'orderNumber' | 'paymentStatus' | 'createdAt'>) => {
    const order = await db.transaction('rw', db.orders, db.meta, async () => {
      const current = (await db.meta.get('orderSequence'))?.value ?? 0
      const next = current + 1
      await db.meta.put({ key: 'orderSequence', value: next })
      const created: Order = {
        ...data,
        id: createId('order'),
        orderNumber: nextOrderNumber(next),
        paymentStatus: 'paid',
        paymentMethod: data.paymentMethod as PaymentMethod,
        createdAt: new Date().toISOString(),
      }
      await db.orders.add(created)
      return created
    })
    await refresh()
    return order
  }

  const deleteOrder = async (id: string) => {
    await db.orders.delete(id)
    await refresh()
  }

  return { orders, loading, refresh, createOrder, deleteOrder }
}
