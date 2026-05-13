import { Outlet } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#6f5f57]">
      <TopNavbar />
      <div className="lg:flex">
        <Sidebar />
        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
