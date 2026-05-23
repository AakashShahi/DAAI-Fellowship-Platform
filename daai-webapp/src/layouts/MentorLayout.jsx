import { mentorNavigation } from '../constants/navigation'
import PortalLayout from './PortalLayout'

export default function MentorLayout() {
  return (
    <PortalLayout
      navigation={mentorNavigation}
      portalLabel="Mentor"
      profilePath="/profile/settings"
    />
  )
}
