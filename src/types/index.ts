export type PaymentMethod = 'card' | 'cash' | 'other'
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'cancelled'
export type OrderSyncStatus = 'synced' | 'pending' | 'failed'

export interface Product {
  id: string
  name: string
  price: number
  tag?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  items: CartItem[]
  subtotal: number
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  notes?: string
  syncStatus: OrderSyncStatus
  cmsOrderId?: string
  cmsOrderNumber?: number
  lastSyncAttemptAt?: string
  syncError?: string
  createdAt: string
}

export interface Settings {
  id: 'settings'
  businessName: string
  currency: string
}

export type Tab = 'pos' | 'orders' | 'products' | 'settings'
