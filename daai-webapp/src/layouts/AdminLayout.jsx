import DashboardLayout from './DashboardLayout'
import { adminNavigation } from '../constants/navigation'

export default function AdminLayout() {
  return (
    <DashboardLayout
      navigation={adminNavigation}
      sidebarTitle="Admin"
      profilePath="/profile/settings"
    />
  )
}
