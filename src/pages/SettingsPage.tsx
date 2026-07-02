import { RotateCcw, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Settings } from '../types'

interface SettingsPageProps {
  settings: Settings
  onSave: (settings: Omit<Settings, 'id'>) => Promise<void>
  onResetDemo: () => Promise<void>
  onClearAll: () => Promise<void>
  onNotify: (message: string) => void
}

export function SettingsPage({ settings, onSave, onResetDemo, onClearAll, onNotify }: SettingsPageProps) {
  const [businessName, setBusinessName] = useState(settings.businessName)
  const [currency, setCurrency] = useState(settings.currency)

  useEffect(() => {
    setBusinessName(settings.businessName)
    setCurrency(settings.currency)
  }, [settings])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onSave({ businessName: businessName.trim() || 'Simple POS', currency: currency.trim().toUpperCase() || 'GBP' })
    onNotify('Settings saved')
  }

  return (
    <section className="max-w-3xl rounded-3xl border border-white/8 bg-zinc-950/70 p-4">
      <h2 className="text-2xl font-black text-white">Settings</h2>
      <p className="mt-1 text-sm text-zinc-400">Local business preferences and device data controls.</p>

      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label>
          <span className="mb-2 block text-sm font-bold text-zinc-300">Business name</span>
          <input className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" value={businessName} onChange={(event) => setBusinessName(event.target.value)} />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-zinc-300">Currency</span>
          <input className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" value={currency} onChange={(event) => setCurrency(event.target.value)} maxLength={3} />
        </label>
        <button className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 font-black text-white hover:bg-blue-400">
          <Save className="h-4 w-4" aria-hidden="true" />
          Save settings
        </button>
      </form>

      <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 md:grid-cols-2">
        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 font-bold text-white hover:bg-zinc-800"
          onClick={() => {
            if (confirm('Reset this device and clear local orders? POS products are managed in the CMS.')) void onResetDemo().then(() => onNotify('Device data reset'))
          }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset device data
        </button>
        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-500/15 px-4 font-bold text-red-200 hover:bg-red-500/25"
          onClick={() => {
            if (confirm('Clear all local POS data? This cannot be undone.')) void onClearAll().then(() => onNotify('All local data cleared'))
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear all data
        </button>
      </div>
    </section>
  )
}
