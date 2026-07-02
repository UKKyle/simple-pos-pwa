import type { Order } from '../types'

const DEVICE_ID_KEY = 'bbm-pos-device-id'

type CmsOrderPayload = {
  externalOrderId: string
  source: 'pos'
  customer?: {
    name?: string
    email?: string
    phone?: string
  }
  items: Array<{
    id?: string
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  subtotal: number
  total: number
  currency: 'GBP' | string
  payment: {
    status: 'paid' | 'pending' | 'failed' | 'cancelled'
    method: 'cash' | 'card' | 'other'
    reference?: string
  }
  pos?: {
    deviceId?: string
    userId?: string
    userName?: string
    location?: string
  }
  notes?: string
  createdAt: string
}

type CmsSyncContext = {
  currency: string
  businessName: string
  posUserName?: string
  posLocation?: string
}

type CmsSyncResult = {
  orderId: string
  orderNumber: number
  duplicate: boolean
}

function getDeviceId() {
  const existing = window.localStorage.getItem(DEVICE_ID_KEY)
  if (existing) return existing

  const created = crypto.randomUUID()
  window.localStorage.setItem(DEVICE_ID_KEY, created)
  return created
}

export function buildCmsOrderPayload(order: Order, context: CmsSyncContext): CmsOrderPayload {
  return {
    externalOrderId: order.id,
    source: 'pos',
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
    },
    items: order.items.map((item) => ({
      id: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
    })),
    subtotal: order.subtotal,
    total: order.total,
    currency: context.currency || 'GBP',
    payment: {
      status: order.paymentStatus,
      method: order.paymentMethod,
      reference: order.orderNumber,
    },
    pos: {
      deviceId: getDeviceId(),
      userName: context.posUserName,
      location: context.posLocation || context.businessName,
    },
    notes: order.notes,
    createdAt: order.createdAt,
  }
}

export async function syncOrderToCms(order: Order, context: CmsSyncContext): Promise<CmsSyncResult> {
  const response = await fetch('/api/cms-orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildCmsOrderPayload(order, context)),
  })

  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
      ? data.error
      : 'CMS sync failed.'
    throw new Error(message)
  }

  if (!data || typeof data !== 'object') {
    throw new Error('CMS sync returned an invalid response.')
  }

  const orderId = 'orderId' in data && typeof data.orderId === 'string' ? data.orderId : ''
  const orderNumber = 'orderNumber' in data ? Number(data.orderNumber) : NaN
  const duplicate = 'duplicate' in data && typeof data.duplicate === 'boolean' ? data.duplicate : false

  if (!orderId || !Number.isFinite(orderNumber)) {
    throw new Error('CMS sync returned an incomplete order response.')
  }

  return { orderId, orderNumber, duplicate }
}
