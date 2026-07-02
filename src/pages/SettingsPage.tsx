import { Moon, RotateCcw, Save, Sun, Trash2 } from 'lucide-react'
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
  const [theme, setTheme] = useState<'light' | 'dark'>(settings.theme ?? 'light')
  const dark = theme === 'dark'

  useEffect(() => {
    setBusinessName(settings.businessName)
    setCurrency(settings.currency)
    setTheme(settings.theme ?? 'light')
  }, [settings])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onSave({ businessName: businessName.trim() || 'Simple POS', currency: currency.trim().toUpperCase() || 'GBP', theme })
    onNotify('Settings saved')
  }

  return (
    <section className={`max-w-3xl rounded-[26px] border p-4 shadow-xl ${dark ? 'border-white/10 bg-[#0f1113] shadow-black/35' : 'border-black/8 bg-white shadow-black/8'}`}>
      <h2 className={`text-2xl font-black ${dark ? 'text-white' : 'text-[#202223]'}`}>Settings</h2>
      <p className={`mt-1 text-sm ${dark ? 'text-white/55' : 'text-[#6d7175]'}`}>Local business preferences and device data controls.</p>

      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label>
          <span className={`mb-2 block text-sm font-bold ${dark ? 'text-white/70' : 'text-[#5f6368]'}`}>Business name</span>
          <input className={`h-12 w-full rounded-[16px] border px-4 outline-none focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 ${dark ? 'border-white/10 bg-white/6 text-white' : 'border-black/8 bg-[#f8fafc] text-[#202223]'}`} value={businessName} onChange={(event) => setBusinessName(event.target.value)} />
        </label>
        <label>
          <span className={`mb-2 block text-sm font-bold ${dark ? 'text-white/70' : 'text-[#5f6368]'}`}>Currency</span>
          <input className={`h-12 w-full rounded-[16px] border px-4 outline-none focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 ${dark ? 'border-white/10 bg-white/6 text-white' : 'border-black/8 bg-[#f8fafc] text-[#202223]'}`} value={currency} onChange={(event) => setCurrency(event.target.value)} maxLength={3} />
        </label>
        <fieldset>
          <legend className={`mb-2 block text-sm font-bold ${dark ? 'text-white/70' : 'text-[#5f6368]'}`}>Appearance</legend>
          <div className={`grid max-w-sm grid-cols-2 rounded-[18px] border p-1 ${dark ? 'border-white/10 bg-white/6' : 'border-black/8 bg-[#f8fafc]'}`}>
            {(['light', 'dark'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={`flex h-11 items-center justify-center gap-2 rounded-[14px] text-sm font-black capitalize transition ${
                  theme === option ? 'bg-[#008060] text-white shadow-sm' : dark ? 'text-white/65 hover:bg-white/10' : 'text-[#5f6368] hover:bg-white'
                }`}
                onClick={() => setTheme(option)}
              >
                {option === 'light' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                {option}
              </button>
            ))}
          </div>
        </fieldset>
        <button className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-[16px] bg-[#008060] px-5 font-black text-white hover:bg-[#006e52]">
          <Save className="h-4 w-4" aria-hidden="true" />
          Save settings
        </button>
      </form>

      <div className={`mt-8 grid gap-3 border-t pt-6 md:grid-cols-2 ${dark ? 'border-white/10' : 'border-black/8'}`}>
        <button
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-[16px] px-4 font-bold ${dark ? 'bg-white/8 text-white hover:bg-white/12' : 'bg-[#f1f2f4] text-[#202223] hover:bg-[#e7e9eb]'}`}
          onClick={() => {
            if (confirm('Reset this device and clear local orders? POS products are managed in the CMS.')) void onResetDemo().then(() => onNotify('Device data reset'))
          }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset device data
        </button>
        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-red-500/15 px-4 font-bold text-red-600 hover:bg-red-500/25"
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
