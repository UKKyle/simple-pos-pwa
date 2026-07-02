import { Wifi } from 'lucide-react'

interface TopBarProps {
  businessName: string
  pendingSyncCount: number
  online: boolean
}

export function TopBar({ businessName, pendingSyncCount, online }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/8 bg-white px-4 md:h-[72px] md:px-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6d7175]">Point of Sale</p>
        <h1 className="text-lg font-black text-[#202223] md:text-2xl">{businessName}</h1>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-black/8 bg-[#f8fafc] px-3 py-2 text-xs font-bold text-[#5f6368] shadow-sm">
        <Wifi className={`h-4 w-4 ${online ? 'text-[#008060]' : 'text-[#b7791f]'}`} aria-hidden="true" />
        {online ? 'Online' : 'Offline'}
        {pendingSyncCount > 0 && (
          <span className="rounded-full bg-[#eef6ff] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#1256a1]">
            {pendingSyncCount} pending
          </span>
        )}
      </div>
    </header>
  )
}
