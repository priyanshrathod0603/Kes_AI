'use client'

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { useIsDesktop } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const isDesktop = useIsDesktop()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        isOpen={isDesktop ? true : sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={!isDesktop}
      />

      <div className={cn('flex min-h-screen flex-col', isDesktop && 'lg:ml-72')}>
        <TopNavbar
          onMenuClick={() => setSidebarOpen(true)}
          isMobile={!isDesktop}
        />
        <main id="main-content" role="main" className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
