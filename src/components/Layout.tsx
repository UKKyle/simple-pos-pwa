import type { ReactNode } from 'react'
import type { Tab } from '../types'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface LayoutProps {
  activeTab: Tab
  businessName: string
  pendingSyncCount: number
  online: boolean
  theme: 'light' | 'dark'
  children: ReactNode
  onTabChange: (tab: Tab) => void
}

export function Layout({ activeTab, businessName, pendingSyncCount, online, theme, children, onTabChange }: LayoutProps) {
  const dark = theme === 'dark'

  return (
    <div className={`h-dvh overflow-hidden ${dark ? 'bg-[#060708] text-white' : 'bg-[#f3f4f6] text-[#202223]'}`}>
      <div className="flex h-full overflow-hidden">
        <Sidebar activeTab={activeTab} theme={theme} onChange={onTabChange} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden pb-20 md:pb-0">
          <TopBar businessName={businessName} pendingSyncCount={pendingSyncCount} online={online} theme={theme} />
          <main className="min-h-0 flex-1 overflow-hidden p-3 md:p-4 lg:p-5">{children}</main>
        </div>
      </div>
    </div>
  )
}
