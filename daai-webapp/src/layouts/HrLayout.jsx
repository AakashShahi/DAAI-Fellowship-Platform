import { hrNavigation } from '../constants/navigation'
import PortalLayout from './PortalLayout'

export default function HrLayout() {
  return (
    <PortalLayout
      navigation={hrNavigation}
      portalLabel="HR"
      profilePath="/profile/settings"
    />
  )
}
