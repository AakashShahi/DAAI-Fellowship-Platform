import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function TopNavbar({ profilePath = '/profile/settings' }) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-[#4f46e5] text-2xl font-black text-white">
            D
          </span>
          <div className="leading-none">
            <p className="text-2xl font-black text-[#0f172a]">DAAI</p>
            <p className="mt-1 text-xs font-black uppercase tracking-wide text-[#4f46e5]">
              Fellowship
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-[#0f172a]">
              {user?.full_name ?? 'Admin User'}
            </p>
            <p className="text-xs font-medium text-[#475569]">
              {user?.role ?? 'ADMIN'}
            </p>
          </div>
          <Link
            to={profilePath}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-[#475569] transition hover:bg-[#eef2ff] hover:text-[#0f172a]"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-md bg-[#4f46e5] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#4338ca]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
