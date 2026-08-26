'use client'

import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { getPageTitle } from '@/lib/page-titles'
import { cn } from '@/lib/utils'

interface TopNavbarProps {
  onMenuClick: () => void
  isMobile: boolean
}

export function TopNavbar({ onMenuClick, isMobile }: TopNavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-sm border-b border-border'
      )}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              aria-label="Open menu"
              className="-ml-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
            {getPageTitle(location.pathname)}
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => navigate('/study-material')}
            className="hidden sm:inline-flex"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="relative h-10 w-10 rounded-xl inline-flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="User menu"
            >
              <Avatar fallback="You" size="md" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Student</p>
                  <p className="text-xs leading-none text-foreground-muted">
                    KES — Krishna Software Solution
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
