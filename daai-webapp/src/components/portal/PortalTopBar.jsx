import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function PortalTopBar({
  profilePath = '/profile/settings',
  contextSlot,
  isMenuOpen = false,
  onMenuToggle,
}) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <span className="flex h-4 w-5 flex-col justify-between" aria-hidden="true">
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
            </span>
          </button>

          <Link to="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 text-lg font-bold text-white">
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
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <span className="text-lg" aria-hidden>
              🔔
            </span>
          </button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {user?.full_name ?? 'User'}
            </p>
            <p className="text-xs text-slate-500">{user?.role ?? ''}</p>
          </div>
          <Link
            to={profilePath}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      </div>
      {contextSlot ? <div className="border-t border-slate-100 px-4 py-2 md:hidden">{contextSlot}</div> : null}
    </header>
  )
}
