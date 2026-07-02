import { db } from './db'
import type { Settings } from '../types'

export async function ensureSeedData() {
  const [settings, catalogState] = await Promise.all([
    db.settings.get('settings'),
    db.meta.get('catalogState'),
  ])

  if (!settings) {
    const defaultSettings: Settings = {
      id: 'settings',
      businessName: 'Simple POS',
      currency: 'GBP',
      theme: 'light',
    }
    await db.settings.put(defaultSettings)
  }

  if (!catalogState) {
    await db.meta.put({ key: 'catalogState', value: 'cms-managed' })
  }
}

export async function resetDemoData() {
  await db.transaction('rw', db.products, db.orders, db.meta, db.settings, async () => {
    await Promise.all([db.products.clear(), db.orders.clear(), db.meta.clear()])
    await db.settings.put({ id: 'settings', businessName: 'Simple POS', currency: 'GBP', theme: 'light' })
  })
  await db.meta.put({ key: 'catalogState', value: 'cms-managed' })
}

export async function clearAllData() {
  await db.transaction('rw', db.products, db.orders, db.meta, db.settings, async () => {
    await Promise.all([db.products.clear(), db.orders.clear(), db.meta.clear(), db.settings.clear()])
  })
}
