import DashboardLayout from './DashboardLayout'
import { fellowNavigation } from '../constants/navigation'

export default function FellowLayout() {
  return (
    <DashboardLayout
      navigation={fellowNavigation}
      sidebarTitle="Fellow"
      profilePath="/fellow/profile/settings"
    />
  )
}
