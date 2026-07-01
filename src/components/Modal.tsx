import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-black/60 p-3 backdrop-blur-sm md:place-items-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-bold text-white">
            {title}
          </h2>
          <button className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Close dialog">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
