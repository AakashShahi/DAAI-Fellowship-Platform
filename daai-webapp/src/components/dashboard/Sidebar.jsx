import { NavLink } from 'react-router-dom'

const adminMenuItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Applications', to: '/admin/applications' },
  { label: 'Fellows', to: '/admin/fellows' },
  { label: 'Cohorts', to: '/admin/cohorts' },
  { label: 'Trainers', to: '/admin/trainers' },
  { label: 'Employers', to: '/admin/employers' },
  { label: 'Opportunities', to: '/admin/opportunities' },
  { label: 'Quizzes', to: '/admin/quizzes' },
  { label: 'Reports', to: '/admin/reports' },
  { label: 'Settings', to: '/admin/settings' },
]

export default function Sidebar() {
  return (
    <aside className="border-orange-100 bg-[#fff8f3] lg:min-h-screen lg:w-72 lg:border-r">
      <div className="px-4 py-5 lg:px-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#f26322]">
          Admin
        </p>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {adminMenuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-[#f26322] text-white shadow-sm'
                    : 'text-[#6f5f57] hover:bg-[#fff1e8] hover:text-[#24140e]',
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
