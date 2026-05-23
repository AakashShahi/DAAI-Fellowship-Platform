import { Link } from 'react-router-dom'
import { Bell, LogOut, Menu, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import Button from '../ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu'
import useAuthStore from '../../store/authStore'

export default function PortalTopBar({
  profilePath = '/profile/settings',
  contextSlot,
  isMenuOpen = false,
  onMenuToggle,
}) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const initials = (user?.full_name || user?.email || 'User')
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>

          <Link to="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              D
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-bold text-slate-900">DAAI Fellowship</span>
              <span className="block text-xs text-slate-500">Learning portal</span>
            </span>
          </Link>
        </div>

        {contextSlot ? (
          <div className="hidden flex-1 px-4 md:block">{contextSlot}</div>
        ) : null}

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {user?.full_name ?? 'User'}
            </p>
            <p className="text-xs text-slate-500">{user?.role ?? ''}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                aria-label="Open user menu"
              >
                <Avatar>
                  <AvatarFallback>{initials || 'U'}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <span className="block text-sm font-semibold text-slate-900">
                  {user?.full_name ?? 'User'}
                </span>
                <span className="block text-xs font-normal text-slate-500">
                  {user?.email ?? user?.role ?? ''}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={profilePath}>
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={logout}>
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {contextSlot ? <div className="border-t border-slate-100 px-4 py-2 md:hidden">{contextSlot}</div> : null}
    </header>
  )
}
