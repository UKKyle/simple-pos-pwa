import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  theme: 'light' | 'dark'
  children: ReactNode
  onClose: () => void
}

export function Modal({ title, theme, children, onClose }: ModalProps) {
  const dark = theme === 'dark'

  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-black/60 p-3 backdrop-blur-sm md:place-items-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl border p-5 shadow-2xl md:p-6 ${dark ? 'border-white/10 bg-zinc-950' : 'border-black/8 bg-white'}`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 id="modal-title" className={`text-xl font-bold ${dark ? 'text-white' : 'text-[#202223]'}`}>
            {title}
          </h2>
          <button className={`rounded-xl p-2 ${dark ? 'text-zinc-400 hover:bg-white/10 hover:text-white' : 'text-[#6d7175] hover:bg-[#f1f2f4] hover:text-[#202223]'}`} onClick={onClose} aria-label="Close dialog">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
