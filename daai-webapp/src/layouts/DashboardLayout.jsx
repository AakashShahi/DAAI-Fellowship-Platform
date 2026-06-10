import { Outlet } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'

export default function DashboardLayout({
  navigation,
  sidebarTitle,
  profilePath = '/profile/settings',
}) {
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-[#f8fafc] text-[#475569]">
      <TopNavbar profilePath={profilePath} />
      <div className="min-h-0 flex-1 lg:flex">
        <Sidebar items={navigation} sectionLabel={sidebarTitle} />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
