'use client'

import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SIDEBAR_NAV_ITEMS, SIDEBAR_BOTTOM_ITEMS, APP_NAME, COMPANY_NAME } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

function NavList({ items, onNavigate }: { items: readonly NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="px-3 space-y-1" aria-label="Main menu">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.label}
            to={item.href}
            onClick={onNavigate}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-foreground-muted hover:bg-muted hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-primary-600' : '')} />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-violet-600">
        <Bot className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-base text-foreground">{APP_NAME}</span>
        <span className="text-[11px] text-foreground-muted">{COMPANY_NAME}</span>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  // Desktop sidebar is always present (static column).
  if (!isMobile) {
    return (
      <aside
        className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-72 flex-col border-r border-border bg-surface"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center px-5 border-b border-border">
          <Brand />
        </div>

        <ScrollArea className="flex-1 py-4">
          <NavList items={SIDEBAR_NAV_ITEMS} />
          <Separator className="my-4 mx-3" />
          <NavList items={SIDEBAR_BOTTOM_ITEMS} />
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar fallback="You" size="md" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Student</p>
              <p className="text-xs text-foreground-muted truncate">{APP_NAME}</p>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  // Mobile drawer.
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-full w-72 bg-surface border-r border-border flex flex-col"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between px-5 border-b border-border">
              <Brand />
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 py-4">
              <NavList items={SIDEBAR_NAV_ITEMS} onNavigate={onClose} />
              <Separator className="my-4 mx-3" />
              <NavList items={SIDEBAR_BOTTOM_ITEMS} onNavigate={onClose} />
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Avatar fallback="You" size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Student</p>
                  <p className="text-xs text-foreground-muted truncate">{APP_NAME}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
