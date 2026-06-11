import { instructorNavigation } from '../constants/navigation'
import PortalLayout from './PortalLayout'

export default function InstructorLayout() {
  return (
    <PortalLayout
      navigation={instructorNavigation}
      portalLabel="Instructor"
      profilePath="/profile/settings"
    />
  )
}
