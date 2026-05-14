import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function TopNavbar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-[#f26322] text-2xl font-black text-white">
            D
          </span>
          <div className="leading-none">
            <p className="text-2xl font-black text-[#24140e]">DAAI</p>
            <p className="mt-1 text-xs font-black uppercase tracking-wide text-[#f26322]">
              Fellowship
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-[#24140e]">
              {user?.full_name ?? 'Admin User'}
            </p>
            <p className="text-xs font-medium text-[#6f5f57]">
              {user?.role ?? 'ADMIN'}
            </p>
          </div>
          <Link
            to="/profile/settings"
            className="rounded-md border border-orange-100 px-4 py-2 text-sm font-bold text-[#6f5f57] transition hover:bg-[#fff1e8] hover:text-[#24140e]"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-md bg-[#f26322] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d94f13]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
