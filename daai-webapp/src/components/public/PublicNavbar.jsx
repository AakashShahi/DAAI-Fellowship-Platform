import { useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import { cn } from '../../lib/cn'

const NAVBAR_OFFSET = 100

const navLinks = [
  { label: 'Fellowship', to: '/fellowship#fellowship' },
  { label: 'Pathways', to: '/fellowship#pathways' },
  { label: 'How It Works', to: '/fellowship#how-it-works' },
  { label: 'Outcomes', to: '/fellowship#outcomes' },
  { label: 'Apply', to: '/fellowship#apply' },
]

export default function PublicNavbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (to) => {
    const [path, hash] = to.split('#')
    if (location.pathname !== path) return false
    // "Fellowship" link is active when no hash or #fellowship
    if (hash === 'fellowship') {
      return !location.hash || location.hash === '#fellowship'
    }
    return location.hash === `#${hash}`
  }

  // When already on /fellowship, React Router won't re-trigger a navigation
  // for the same pathname, so we manually scroll to the target.
  const handleClick = useCallback(
    (e, to) => {
      const [path, hash] = to.split('#')
      if (location.pathname === path && hash) {
        e.preventDefault()
        // Push the hash so URL and active state update
        navigate(to)
        const el = document.getElementById(hash)
        if (el) {
          const top =
            el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET
          window.scrollTo({ top, behavior: 'smooth' })
        }
      }
      // If navigating from a different page, let React Router handle it
      // and ScrollToHash will pick it up.
    },
    [location.pathname, navigate],
  )

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 text-lg font-bold text-white">
            D
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-slate-900">DAAI Fellowship</span>
            <span className="block text-xs text-slate-500">by CloudMandap</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={(e) => handleClick(e, link.to)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive(link.to)
                  ? 'text-indigo-700 bg-indigo-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button to="/login" variant="ghost" size="sm">
            Login
          </Button>
          <Button to="/fellowship/apply" size="sm">
            Apply Now
          </Button>
        </div>

        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Menu
        </button>
      </div>

      {open ? (
        <nav className="border-t border-slate-100 px-4 py-4 md:hidden">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={(e) => {
                    handleClick(e, link.to)
                    setOpen(false)
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Button to="/login" variant="secondary" className="w-full">
                Login
              </Button>
            </li>
            <li>
              <Button to="/fellowship/apply" className="w-full">
                Apply Now
              </Button>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
