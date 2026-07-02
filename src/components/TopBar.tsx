import { Wifi } from 'lucide-react'

interface TopBarProps {
  businessName: string
  pendingSyncCount: number
  online: boolean
  theme: 'light' | 'dark'
}

export function TopBar({ businessName, pendingSyncCount, online, theme }: TopBarProps) {
  const dark = theme === 'dark'

  return (
    <header className={`flex h-16 shrink-0 items-center justify-between border-b px-4 md:h-[72px] md:px-6 ${dark ? 'border-white/10 bg-[#0b0d0f]' : 'border-black/8 bg-white'}`}>
      <div>
        <p className={`text-xs font-black uppercase tracking-[0.18em] ${dark ? 'text-white/45' : 'text-[#6d7175]'}`}>Point of Sale</p>
        <h1 className={`text-lg font-black md:text-2xl ${dark ? 'text-white' : 'text-[#202223]'}`}>{businessName}</h1>
      </div>
      <div className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold shadow-sm ${dark ? 'border-white/10 bg-white/6 text-white/70' : 'border-black/8 bg-[#f8fafc] text-[#5f6368]'}`}>
        <Wifi className={`h-4 w-4 ${online ? 'text-[#008060]' : 'text-[#b7791f]'}`} aria-hidden="true" />
        {online ? 'Online' : 'Offline'}
        {pendingSyncCount > 0 && (
          <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${dark ? 'bg-[#2f80ed]/20 text-[#8fc2ff]' : 'bg-[#eef6ff] text-[#1256a1]'}`}>
            {pendingSyncCount} pending
          </span>
        )}
      </div>
    </header>
  )
}
