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
      <nav className="hidden w-24 shrink-0 flex-col items-center gap-3 border-r border-black/8 bg-white px-4 py-5 shadow-sm md:flex" aria-label="Main navigation">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`grid h-16 w-16 place-items-center rounded-[20px] transition ${activeTab === id ? 'bg-[#1d1d1d] text-white shadow-lg shadow-black/10' : 'text-[#6d7175] hover:bg-[#f1f2f4] hover:text-[#202223]'}`}
            onClick={() => onChange(id)}
            aria-label={label}
            title={label}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        ))}
      </nav>
      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-[22px] border border-black/8 bg-white/95 p-2 shadow-2xl shadow-black/15 backdrop-blur md:hidden" aria-label="Main navigation">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded-[16px] text-[11px] font-bold transition ${activeTab === id ? 'bg-[#1d1d1d] text-white' : 'text-[#6d7175]'}`}
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
