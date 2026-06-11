import { NavLink } from 'react-router-dom'
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CircleHelp,
  ClipboardList,
  FileText,
  GraduationCap,
  Inbox,
  Layers,
  LayoutDashboard,
  Megaphone,
  NotebookText,
  Settings,
  Target,
  X,
  UserCheck,
  UserPlus,
  Users,
  ScrollText,
  Star,
} from 'lucide-react'
import { cn } from '../../lib/cn'

const navigationIcons = {
  Applications: FileText,
  Assignments: ClipboardList,
  Attendance: UserCheck,
  Batches: Layers,
  Certificates: Award,
  Cohorts: GraduationCap,
  Dashboard: LayoutDashboard,
  Enrollments: UserCheck,
  Fellows: Users,
  Lessons: NotebookText,
  Modules: BookOpen,
  Announcements: Megaphone,
  'My Learning': BookOpen,
  Profile: Users,
  Progress: BarChart3,
  Quizzes: CircleHelp,
  Reports: BarChart3,
  'Review assignments': ClipboardList,
  Sessions: Calendar,
  Settings,
  Submissions: Inbox,
  Tracks: Target,
  Staff: Users,
  // HR specific
  'Staff Onboarding': UserPlus,
  'Fellow Management': Users,
  'Instructor Assignment': GraduationCap,
  'HR Activity Logs': ScrollText,
  // Instructor specific
  'My Cohorts': GraduationCap,
  Grades: Star,
}

export default function PortalSidebar({ items, sectionLabel, isOpen = false, onClose }) {
  return (
    <>
      <button
        type="button"
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/35 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-label="Close menu"
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82vw] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-xl transition-all duration-200 ease-out lg:static lg:h-full lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:shadow-none',
          isOpen
            ? 'translate-x-0 lg:w-64 lg:opacity-100'
            : '-translate-x-full lg:w-0 lg:border-r-0 lg:opacity-0',
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 lg:w-64 lg:shrink-0 lg:px-5">
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {sectionLabel}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">DAAI Admin</p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
              onClick={onClose}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <nav className="mt-4 flex flex-col gap-2">
            {items.map((item) => {
              const Icon = navigationIcons[item.label] || FileText

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => {
                    if (window.matchMedia('(max-width: 1023px)').matches) {
                      onClose()
                    }
                  }}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
