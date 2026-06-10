import { adminNavigation } from '../constants/navigation'
import PortalLayout from './PortalLayout'

export default function AdminLayout() {
  return (
    <PortalLayout
      navigation={adminNavigation}
      portalLabel="Admin"
      profilePath="/profile/settings"
    />
  )
}
