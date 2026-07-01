import { Wifi } from 'lucide-react'

interface TopBarProps {
  businessName: string
}

export function TopBar({ businessName }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-black/70 px-4 backdrop-blur md:h-16 md:px-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Simple POS</p>
        <h1 className="text-lg font-black text-white md:text-2xl">{businessName}</h1>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/8 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 shadow-lg shadow-black/20">
        <Wifi className="h-4 w-4 text-blue-400" aria-hidden="true" />
        Offline ready
      </div>
    </header>
  )
}
