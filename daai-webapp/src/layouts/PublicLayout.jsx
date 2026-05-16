import { Outlet } from 'react-router-dom'
import PublicFooter from '../components/public/PublicFooter'
import PublicNavbar from '../components/public/PublicNavbar'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
