import { Home, Package, ReceiptText, Settings } from 'lucide-react'
import type { Tab } from '../types'

const tabs = [
  { id: 'pos', label: 'POS', icon: Home },
  { id: 'orders', label: 'Orders', icon: ReceiptText },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

interface SidebarProps {
  activeTab: Tab
  onChange: (tab: Tab) => void
}

export function Sidebar({ activeTab, onChange }: SidebarProps) {
  return (
    <>
      <nav className="hidden w-20 shrink-0 flex-col items-center gap-3 border-r border-white/8 bg-black/40 px-3 py-5 md:flex" aria-label="Main navigation">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`grid h-14 w-14 place-items-center rounded-2xl transition ${activeTab === id ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`}
            onClick={() => onChange(id)}
            aria-label={label}
            title={label}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        ))}
      </nav>
      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur md:hidden" aria-label="Main navigation">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold transition ${activeTab === id ? 'bg-blue-500 text-white' : 'text-zinc-400'}`}
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
