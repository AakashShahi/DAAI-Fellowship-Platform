import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import PortalSidebar from '../components/portal/PortalSidebar'
import PortalTopBar from '../components/portal/PortalTopBar'

export default function PortalLayout({
  navigation,
  portalLabel,
  profilePath,
  contextSlot,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <PortalTopBar
        profilePath={profilePath}
        contextSlot={contextSlot}
        isMenuOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <div className="lg:flex">
        <PortalSidebar
          items={navigation}
          sectionLabel={portalLabel}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
