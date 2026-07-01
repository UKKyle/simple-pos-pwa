import Dexie, { type Table } from 'dexie'
import type { Order, Product, Settings } from '../types'

class PosDatabase extends Dexie {
  products!: Table<Product, string>
  orders!: Table<Order, string>
  settings!: Table<Settings, string>
  meta!: Table<{ key: string; value: number }, string>

  constructor() {
    super('simple_pos_pwa')
    this.version(1).stores({
      products: 'id, name, active, createdAt, updatedAt',
      orders: 'id, orderNumber, createdAt, paymentMethod, customerEmail',
      settings: 'id',
      meta: 'key',
    })
  }
}

export const db = new PosDatabase()
