import { Home, ReceiptText, Settings } from 'lucide-react'
import type { Tab } from '../types'

const tabs = [
  { id: 'pos', label: 'POS', icon: Home },
  { id: 'orders', label: 'Orders', icon: ReceiptText },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

interface SidebarProps {
  activeTab: Tab
  theme: 'light' | 'dark'
  onChange: (tab: Tab) => void
}

export function Sidebar({ activeTab, theme, onChange }: SidebarProps) {
  const dark = theme === 'dark'

  return (
    <>
      <nav className={`hidden w-24 shrink-0 flex-col items-center gap-3 border-r px-4 py-5 shadow-sm md:flex ${dark ? 'border-white/10 bg-[#0f1113]' : 'border-black/8 bg-white'}`} aria-label="Main navigation">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`grid h-16 w-16 place-items-center rounded-[20px] transition ${
              activeTab === id
                ? dark ? 'bg-[#2f80ed] text-white shadow-lg shadow-black/20' : 'bg-[#1d1d1d] text-white shadow-lg shadow-black/10'
                : dark ? 'text-white/55 hover:bg-white/10 hover:text-white' : 'text-[#6d7175] hover:bg-[#f1f2f4] hover:text-[#202223]'
            }`}
            onClick={() => onChange(id)}
            aria-label={label}
            title={label}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        ))}
      </nav>
      <nav className={`fixed inset-x-3 bottom-3 z-30 grid grid-cols-3 rounded-[22px] border p-2 shadow-2xl backdrop-blur md:hidden ${dark ? 'border-white/10 bg-[#151719]/95 shadow-black/40' : 'border-black/8 bg-white/95 shadow-black/15'}`} aria-label="Main navigation">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded-[16px] text-[11px] font-bold transition ${activeTab === id ? dark ? 'bg-[#2f80ed] text-white' : 'bg-[#1d1d1d] text-white' : dark ? 'text-white/55' : 'text-[#6d7175]'}`}
            onClick={() => onChange(id)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </>
  )
}
