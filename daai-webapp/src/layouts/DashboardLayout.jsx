import { Outlet } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'

export default function DashboardLayout({
  navigation,
  sidebarTitle,
  profilePath = '/profile/settings',
}) {
  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#6f5f57]">
      <TopNavbar profilePath={profilePath} />
      <div className="lg:flex">
        <Sidebar items={navigation} sectionLabel={sidebarTitle} />
        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
