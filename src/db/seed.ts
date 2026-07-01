import { db } from './db'
import type { Product, Settings } from '../types'
import { createId } from '../utils/ids'

const demoProducts = [
  ['Chocolate Brownie Box', 12],
  ['Vanilla Cupcake Box', 15],
  ['Custom Cake Deposit', 20],
  ['Delivery Fee', 5],
] as const

export async function ensureSeedData() {
  const [productCount, settings] = await Promise.all([
    db.products.count(),
    db.settings.get('settings'),
  ])

  if (!settings) {
    const defaultSettings: Settings = {
      id: 'settings',
      businessName: 'Simple POS',
      currency: 'GBP',
    }
    await db.settings.put(defaultSettings)
  }

  if (productCount === 0) {
    const now = new Date().toISOString()
    const products: Product[] = demoProducts.map(([name, price]) => ({
      id: createId('product'),
      name,
      price,
      active: true,
      createdAt: now,
      updatedAt: now,
    }))
    await db.products.bulkAdd(products)
  }
}

export async function resetDemoData() {
  await db.transaction('rw', db.products, db.orders, db.meta, db.settings, async () => {
    await Promise.all([db.products.clear(), db.orders.clear(), db.meta.clear()])
    await db.settings.put({ id: 'settings', businessName: 'Simple POS', currency: 'GBP' })
  })
  await ensureSeedData()
}

export async function clearAllData() {
  await db.transaction('rw', db.products, db.orders, db.meta, db.settings, async () => {
    await Promise.all([db.products.clear(), db.orders.clear(), db.meta.clear(), db.settings.clear()])
  })
}
