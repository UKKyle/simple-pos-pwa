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
    <div className="min-h-dvh bg-black text-white">
      <div className="flex min-h-dvh">
        <Sidebar activeTab={activeTab} onChange={onTabChange} />
        <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
          <TopBar businessName={businessName} />
          <main className="min-h-0 flex-1 overflow-auto p-3 md:p-5">{children}</main>
        </div>
      </div>
    </div>
  )
}
