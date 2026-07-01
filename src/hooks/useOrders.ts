import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/db'
import { syncOrderToCms } from '../lib/cmsSync'
import type { Order, PaymentMethod } from '../types'
import { createId, nextOrderNumber } from '../utils/ids'

type SyncContext = {
  currency: string
  businessName: string
  posUserName?: string
  posLocation?: string
}

type CreateOrderInput = Omit<Order, 'id' | 'orderNumber' | 'paymentStatus' | 'createdAt' | 'syncStatus' | 'cmsOrderId' | 'cmsOrderNumber' | 'lastSyncAttemptAt' | 'syncError'>

function friendlySyncError(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim()
  }

  return 'CMS sync failed. The order is still saved locally.'
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const refresh = useCallback(async () => {
    const all = await db.orders.orderBy('createdAt').reverse().toArray()
    setOrders(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const updateSyncState = useCallback(async (id: string, patch: Partial<Order>) => {
    await db.orders.update(id, patch)
  }, [])

  const syncSingleOrder = useCallback(async (order: Order, context: SyncContext) => {
    const lastSyncAttemptAt = new Date().toISOString()
    await updateSyncState(order.id, {
      syncStatus: 'pending',
      lastSyncAttemptAt,
      syncError: undefined,
    })

    try {
      const result = await syncOrderToCms(order, context)

      await updateSyncState(order.id, {
        syncStatus: 'synced',
        cmsOrderId: result.orderId,
        cmsOrderNumber: result.orderNumber,
        lastSyncAttemptAt,
        syncError: undefined,
      })
    } catch (error) {
      await updateSyncState(order.id, {
        syncStatus: 'failed',
        lastSyncAttemptAt,
        syncError: friendlySyncError(error),
      })
      throw error
    }
  }, [updateSyncState])

  const createOrder = useCallback(async (data: CreateOrderInput, context: SyncContext) => {
    const order = await db.transaction('rw', db.orders, db.meta, async () => {
      const rawCurrent = (await db.meta.get('orderSequence'))?.value
      const current = typeof rawCurrent === 'number' ? rawCurrent : 0
      const next = current + 1
      await db.meta.put({ key: 'orderSequence', value: next })
      const created: Order = {
        ...data,
        id: createId('order'),
        orderNumber: nextOrderNumber(next),
        paymentStatus: 'paid',
        paymentMethod: data.paymentMethod as PaymentMethod,
        syncStatus: 'pending',
        createdAt: new Date().toISOString(),
      }
      await db.orders.add(created)
      return created
    })

    try {
      await syncSingleOrder(order, context)
    } catch {
      // Local save is the primary source of safety; sync retries happen separately.
    }

    await refresh()
    return await db.orders.get(order.id) ?? order
  }, [refresh, syncSingleOrder])

  const syncPendingOrders = useCallback(async (context: SyncContext) => {
    setSyncing(true)
    try {
      const pendingOrders = await db.orders
        .filter((order) => order.syncStatus === 'pending' || order.syncStatus === 'failed')
        .sortBy('createdAt')

      let syncedCount = 0
      let failedCount = 0

      for (const order of pendingOrders) {
        try {
          await syncSingleOrder(order, context)
          syncedCount += 1
        } catch {
          failedCount += 1
        }
      }

      await refresh()
      return { syncedCount, failedCount, total: pendingOrders.length }
    } finally {
      setSyncing(false)
    }
  }, [refresh, syncSingleOrder])

  const deleteOrder = async (id: string) => {
    await db.orders.delete(id)
    await refresh()
  }

  const pendingSyncCount = orders.filter((order) => order.syncStatus === 'pending' || order.syncStatus === 'failed').length
  const failedSyncCount = orders.filter((order) => order.syncStatus === 'failed').length

  return {
    orders,
    loading,
    syncing,
    refresh,
    createOrder,
    deleteOrder,
    syncPendingOrders,
    pendingSyncCount,
    failedSyncCount,
  }
}
