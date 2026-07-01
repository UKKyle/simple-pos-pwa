import { Wifi } from 'lucide-react'

interface TopBarProps {
  businessName: string
  pendingSyncCount: number
  online: boolean
}

export function TopBar({ businessName, pendingSyncCount, online }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-black/70 px-4 backdrop-blur md:h-16 md:px-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Simple POS</p>
        <h1 className="text-lg font-black text-white md:text-2xl">{businessName}</h1>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/8 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 shadow-lg shadow-black/20">
        <Wifi className={`h-4 w-4 ${online ? 'text-blue-400' : 'text-amber-300'}`} aria-hidden="true" />
        {online ? 'Online' : 'Offline'}
        {pendingSyncCount > 0 && (
          <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-blue-200">
            {pendingSyncCount} pending
          </span>
        )}
      </div>
    </header>
  )
}
