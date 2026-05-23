import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getFellowMe } from '../services/fellowService'
import useAuthStore from '../store/authStore'

const toUserUpdates = (profile) => ({
  full_name: profile.fullName,
  email: profile.email,
  role: profile.role,
  selectedTrack: profile.selectedTrack,
  learningTrack: profile.learningTrack,
})

export default function FellowTrackGuard() {
  const location = useLocation()
  const updateUser = useAuthStore((state) => state.updateUser)
  const storedUser = useAuthStore((state) => state.user)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const fellowProfile = await getFellowMe()

        if (isMounted) {
          setProfile(fellowProfile)
          updateUser(toUserUpdates(fellowProfile))
        }
      } catch {
        if (isMounted) {
          setError('Unable to verify your learning track.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [updateUser])

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">
        Loading your learning track...
      </div>
    )
  }

  if (error) {
    return <p className="dashboard-alert">{error}</p>
  }

  const selectedTrack = profile?.selectedTrack ?? storedUser?.selectedTrack

  if (!selectedTrack) {
    return (
      <Navigate
        to="/fellow/select-track"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
