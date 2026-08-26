'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Search, Bell, Menu, Settings, ChevronDown, User } from 'lucide-react'

interface TopNavbarProps {
  onMenuClick: () => void
  isMobile: boolean
}

export function TopNavbar({ onMenuClick, isMobile }: TopNavbarProps) {
  const location = useLocation()
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus()
    }
  }, [showSearch])

  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className={cn('sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-sm border-b border-border', 'lg:static')}>
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open menu" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
          </div>

          <div className="relative hidden md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="h-10 px-3 gap-2"
              aria-label={showSearch ? 'Close search' : 'Open search'}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>

            <AnimatePresence mode="wait">
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 280 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-2"
                >
                  <Input
                    ref={searchRef}
                    placeholder="Search..."
                    className="w-[280px] h-10"
                    onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                    onKeyDown={(e) => e.key === 'Escape' && setShowSearch(false)}
                    aria-label="Search"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-[10px] font-medium text-white">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-10 w-10 rounded-xl" aria-label="User menu">
              <Avatar fallback="Student" size="md" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-foreground">Student</p>
                  <p className="text-xs text-foreground-muted">KESH AI Tutor</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/ai-tutor': 'AI Tutor',
    '/classes': 'Classes',
    '/subjects': 'Subjects',
    '/study-material': 'Study Material',
    '/quizzes': 'Quizzes',
    '/progress': 'Progress',
    '/settings': 'Settings',
    '/profile': 'Profile',
  }

  for (const [path, title] of Object.entries(titles)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return title
    }
  }
  return 'Dashboard'
}