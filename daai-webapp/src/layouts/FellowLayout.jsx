import FellowPortalContext from '../components/portal/FellowPortalContext'
import { fellowNavigation } from '../constants/navigation'
import PortalLayout from './PortalLayout'
import LexChatbot from '../components/chatbot/LexChatbot'

export default function FellowLayout() {
  return (
    <>
      <PortalLayout
        navigation={fellowNavigation}
        portalLabel="Fellow"
        profilePath="/fellow/profile/settings"
        contextSlot={<FellowPortalContext />}
      />
      <LexChatbot />
    </>
  )
}
