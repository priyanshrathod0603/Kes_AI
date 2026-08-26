'use client'

import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SIDEBAR_NAV_ITEMS, SIDEBAR_BOTTOM_ITEMS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
}

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onClose}
              aria-hidden="true"
            />
          )}
          <motion.aside
            initial={{ x: isMobile ? -280 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: isMobile ? -280 : 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed left-0 top-0 z-50 h-full w-72 bg-surface border-r border-border flex flex-col',
              'lg:translate-x-0 lg:static lg:z-auto'
            )}
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-violet-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-lg text-foreground">{APP_NAME}</span>
              </div>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 py-4">
              <nav className="px-3 space-y-1" aria-label="Main menu">
                {SIDEBAR_NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                  return (
                    <NavLink
                      key={item.label}
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 shadow-sm'
                            : 'text-foreground-muted hover:bg-muted hover:text-foreground'
                        )
                      }
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </nav>

              <Separator className="my-4" />

              <nav className="px-3 space-y-1" aria-label="Account menu">
                {SIDEBAR_BOTTOM_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.label}
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 shadow-sm'
                            : 'text-foreground-muted hover:bg-muted hover:text-foreground'
                        )
                      }
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Avatar fallback="Student" size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Student</p>
                  <p className="text-xs text-foreground-muted truncate">KESH AI Tutor</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}