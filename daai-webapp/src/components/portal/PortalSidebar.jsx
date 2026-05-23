import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

export default function PortalSidebar({ items, sectionLabel, isOpen = false, onClose }) {
  return (
    <>
      <button
        type="button"
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/35 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-label="Close menu"
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 max-w-[82vw] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:static lg:h-full lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 lg:px-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {sectionLabel}
            </p>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
              onClick={onClose}
            >
              <span aria-hidden="true">X</span>
            </button>
          </div>
          <nav className="mt-4 flex flex-col gap-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
