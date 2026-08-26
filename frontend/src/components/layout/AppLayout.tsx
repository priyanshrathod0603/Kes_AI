'use client'

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useMobile } from '@/hooks'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  className?: string
}

export function AppLayout({ className }: AppLayoutProps) {
  const { isMobile, isTablet } = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      <TopNavbar onMenuClick={() => setSidebarOpen(true)} isMobile={isMobile} />
      <main
        className={cn(
          'transition-all duration-300',
          'lg:ml-72',
          isMobile ? 'pt-16' : 'pt-0'
        )}
        id="main-content"
        role="main"
      >
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  )
}