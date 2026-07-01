import { db } from './db'
import type { Product, Settings } from '../types'
import { createId } from '../utils/ids'

const demoProducts = [
  ['Chocolate Brownie Box', 12, 'Brownies'],
  ['Vanilla Cupcake Box', 15, 'Cupcakes'],
  ['Custom Cake Deposit', 20, undefined],
  ['Delivery Fee', 5, undefined],
] as const

async function seedDemoProducts() {
  const now = new Date().toISOString()
  const products: Product[] = demoProducts.map(([name, price, tag]) => ({
    id: createId('product'),
    name,
    price,
    tag,
    active: true,
    createdAt: now,
    updatedAt: now,
  }))

  await db.products.bulkAdd(products)
  await db.meta.put({ key: 'catalogState', value: 'seeded-demo' })
}

export async function ensureSeedData() {
  const [productCount, orderCount, settings, catalogState] = await Promise.all([
    db.products.count(),
    db.orders.count(),
    db.settings.get('settings'),
    db.meta.get('catalogState'),
  ])

  if (!settings) {
    const defaultSettings: Settings = {
      id: 'settings',
      businessName: 'Simple POS',
      currency: 'GBP',
    }
    await db.settings.put(defaultSettings)
  }

  const isBrandNewInstall = !catalogState && productCount === 0 && orderCount === 0 && !settings

  if (isBrandNewInstall) {
    await seedDemoProducts()
    return
  }

  if (!catalogState) {
    await db.meta.put({ key: 'catalogState', value: 'initialized' })
  }
}

export async function resetDemoData() {
  await db.transaction('rw', db.products, db.orders, db.meta, db.settings, async () => {
    await Promise.all([db.products.clear(), db.orders.clear(), db.meta.clear()])
    await db.settings.put({ id: 'settings', businessName: 'Simple POS', currency: 'GBP' })
  })
  await seedDemoProducts()
}

export async function clearAllData() {
  await db.transaction('rw', db.products, db.orders, db.meta, db.settings, async () => {
    await Promise.all([db.products.clear(), db.orders.clear(), db.meta.clear(), db.settings.clear()])
  })
}
