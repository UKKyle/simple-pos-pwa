import type { ReactNode } from 'react'
import type { Tab } from '../types'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface LayoutProps {
  activeTab: Tab
  businessName: string
  children: ReactNode
  onTabChange: (tab: Tab) => void
}

export function Layout({ activeTab, businessName, children, onTabChange }: LayoutProps) {
  return (
    <div className="h-dvh overflow-hidden bg-black text-white">
      <div className="flex h-full overflow-hidden">
        <Sidebar activeTab={activeTab} onChange={onTabChange} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden pb-20 md:pb-0">
          <TopBar businessName={businessName} />
          <main className="min-h-0 flex-1 overflow-hidden p-3 md:p-4 lg:p-5">{children}</main>
        </div>
      </div>
    </div>
  )
}
