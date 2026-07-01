import { CheckCircle2, X } from 'lucide-react'

interface ToastProps {
  message: string | null
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
      <CheckCircle2 className="h-5 w-5 text-blue-400" aria-hidden="true" />
      <span>{message}</span>
      <button className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Dismiss toast">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
