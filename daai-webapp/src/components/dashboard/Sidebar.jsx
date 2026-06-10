import { NavLink } from 'react-router-dom'
import { adminNavigation } from '../../constants/navigation'

export default function Sidebar({
  items = adminNavigation,
  sectionLabel = 'Admin',
}) {
  return (
    <aside className="min-h-0 shrink-0 overflow-y-auto border-slate-200 bg-[#f8fafc] lg:h-full lg:w-72 lg:border-r">
      <div className="px-4 py-5 lg:px-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#4f46e5]">
          {sectionLabel}
        </p>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-[#4f46e5] text-white shadow-sm'
                    : 'text-[#475569] hover:bg-[#eef2ff] hover:text-[#0f172a]',
                ].join(' ')
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
