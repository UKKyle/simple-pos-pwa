import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/db'
import type { Settings } from '../types'

const fallback: Settings = { id: 'settings', businessName: 'Simple POS', currency: 'GBP' }

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(fallback)

  const refresh = useCallback(async () => {
    setSettings((await db.settings.get('settings')) ?? fallback)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const saveSettings = async (patch: Omit<Settings, 'id'>) => {
    await db.settings.put({ id: 'settings', ...patch })
    await refresh()
  }

  return { settings, refresh, saveSettings }
}
