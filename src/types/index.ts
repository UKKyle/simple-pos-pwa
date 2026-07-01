export type PaymentMethod = 'card' | 'cash'

export interface Product {
  id: string
  name: string
  price: number
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
  paymentStatus: 'paid'
  customerEmail?: string
  createdAt: string
}

export interface Settings {
  id: 'settings'
  businessName: string
  currency: string
}

export type Tab = 'pos' | 'orders' | 'products' | 'settings'
