import DashboardLayout from './DashboardLayout'
import { mentorNavigation } from '../constants/navigation'

export default function MentorLayout() {
  return (
    <DashboardLayout
      navigation={mentorNavigation}
      sidebarTitle="Mentor"
      profilePath="/profile/settings"
    />
  )
}
