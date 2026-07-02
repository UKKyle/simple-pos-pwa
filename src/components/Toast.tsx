import { CheckCircle2, X } from 'lucide-react'

interface ToastProps {
  message: string | null
  theme: 'light' | 'dark'
  onClose: () => void
}

export function Toast({ message, theme, onClose }: ToastProps) {
  if (!message) return null

  const dark = theme === 'dark'

  return (
    <div className={`fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl ${dark ? 'border-white/10 bg-zinc-900 text-white' : 'border-black/8 bg-white text-[#202223]'}`}>
      <CheckCircle2 className="h-5 w-5 text-blue-400" aria-hidden="true" />
      <span>{message}</span>
      <button className={`rounded-lg p-1 ${dark ? 'text-zinc-400 hover:bg-white/10 hover:text-white' : 'text-[#6d7175] hover:bg-[#f1f2f4] hover:text-[#202223]'}`} onClick={onClose} aria-label="Dismiss toast">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
