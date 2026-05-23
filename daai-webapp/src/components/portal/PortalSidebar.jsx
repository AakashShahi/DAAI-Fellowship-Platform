import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

export default function PortalSidebar({ items, sectionLabel }) {
  return (
    <aside className="border-slate-200 bg-white lg:min-h-[calc(100vh-4rem)] lg:w-64 lg:border-r">
      <div className="px-4 py-5 lg:px-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          {sectionLabel}
        </p>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
  )
}
