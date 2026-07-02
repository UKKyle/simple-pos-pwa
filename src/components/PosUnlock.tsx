import { Delete, LockKeyhole } from 'lucide-react'
import { useState } from 'react'

interface PosUnlockProps {
  configured: boolean
  error: string
  theme: 'light' | 'dark'
  onUnlock: (pin: string) => Promise<boolean>
}

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'] as const

export function PosUnlock({ configured, error, theme, onUnlock }: PosUnlockProps) {
  const dark = theme === 'dark'
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const addDigit = (digit: string) => {
    if (submitting) return
    setMessage('')
    setPin((current) => `${current}${digit}`.slice(0, 6))
  }

  const removeDigit = () => {
    if (submitting) return
    setPin((current) => current.slice(0, -1))
  }

  const submit = async () => {
    if (pin.length !== 6 || submitting) return
    setMessage('')
    setSubmitting(true)
    const ok = await onUnlock(pin)
    setSubmitting(false)

    if (!ok) {
      setMessage('PIN was not accepted')
      setPin('')
    }
  }

  return (
    <div className={`grid min-h-dvh place-items-center px-4 py-6 ${dark ? 'bg-[#060708] text-white' : 'bg-[#f3f4f6] text-[#202223]'}`}>
      <div className={`w-full max-w-[420px] rounded-[28px] border p-5 shadow-2xl ${dark ? 'border-white/10 bg-[#0f1113] shadow-black/35' : 'border-black/8 bg-white shadow-black/10'}`}>
        <div className={`flex items-center gap-3 border-b pb-5 ${dark ? 'border-white/10' : 'border-black/6'}`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] ${dark ? 'bg-[#1d3d5e] text-[#8fc2ff]' : 'bg-[#eef6ff] text-[#1256a1]'}`}>
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.18em] ${dark ? 'text-white/45' : 'text-[#6d7175]'}`}>Baked By Mady</p>
            <h1 className="text-xl font-black tracking-tight">POS locked</h1>
          </div>
        </div>

        <p className={`mt-5 text-sm leading-6 ${dark ? 'text-white/60' : 'text-[#5f6368]'}`}>
          {configured
            ? 'Tap the 6 digit PIN from the CMS Point of Sale tab.'
            : 'Create a POS PIN in the CMS Point of Sale tab before using this till.'}
        </p>

        {configured && (
          <div className="mt-6">
            <div className={`grid h-16 grid-cols-6 gap-2 rounded-[20px] border p-2 ${dark ? 'border-white/10 bg-white/6' : 'border-black/8 bg-[#f8fafc]'}`}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={`rounded-[14px] ${pin.length > index ? dark ? 'bg-[#2f80ed]' : 'bg-[#1d1d1d]' : dark ? 'bg-white/12' : 'bg-black/8'}`} />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {keys.map((key) => {
                if (key === 'clear') {
                  return (
                    <button
                      key={key}
                      className={`h-16 rounded-[20px] text-sm font-black uppercase tracking-[0.12em] transition disabled:opacity-50 ${dark ? 'bg-white/8 text-white/65 hover:bg-white/12' : 'bg-[#f1f2f4] text-[#5f6368] hover:bg-[#e5e7eb]'}`}
                      onClick={() => setPin('')}
                      disabled={submitting || pin.length === 0}
                      type="button"
                    >
                      Clear
                    </button>
                  )
                }

                if (key === 'delete') {
                  return (
                    <button
                      key={key}
                      className={`grid h-16 place-items-center rounded-[20px] transition disabled:opacity-50 ${dark ? 'bg-white/8 text-white/65 hover:bg-white/12' : 'bg-[#f1f2f4] text-[#5f6368] hover:bg-[#e5e7eb]'}`}
                      onClick={removeDigit}
                      disabled={submitting || pin.length === 0}
                      type="button"
                      aria-label="Delete last digit"
                    >
                      <Delete className="h-6 w-6" aria-hidden="true" />
                    </button>
                  )
                }

                return (
                  <button
                    key={key}
                    className={`h-16 rounded-[20px] text-2xl font-black text-white transition active:scale-[0.98] disabled:opacity-50 ${dark ? 'bg-[#2f80ed] hover:bg-[#1d6fd8]' : 'bg-[#1d1d1d] hover:bg-black'}`}
                    onClick={() => addDigit(key)}
                    disabled={submitting || pin.length >= 6}
                    type="button"
                  >
                    {key}
                  </button>
                )
              })}
            </div>

            <button
              className="mt-5 h-14 w-full rounded-[20px] bg-[#008060] text-base font-black text-white transition hover:bg-[#006e52] disabled:bg-[#c9cccf] disabled:text-white"
              disabled={pin.length !== 6 || submitting}
              onClick={() => void submit()}
              type="button"
            >
              {submitting ? 'Unlocking...' : 'Unlock POS'}
            </button>
          </div>
        )}

        {(message || error) && (
          <p className="mt-4 rounded-[18px] bg-[#fff0f0] px-4 py-3 text-sm font-bold text-[#a12018]">
            {message || error}
          </p>
        )}
      </div>
    </div>
  )
}
