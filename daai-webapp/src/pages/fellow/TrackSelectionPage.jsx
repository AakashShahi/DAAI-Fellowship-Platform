import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TrackSelectionCard from '../../components/dashboard/TrackSelectionCard'
import { LEARNING_TRACK_OPTIONS } from '../../constants/learningTracks'
import { getFellowMe, selectFellowTrack } from '../../services/fellowService'
import useAuthStore from '../../store/authStore'

export default function TrackSelectionPage() {
  const navigate = useNavigate()
  const updateUser = useAuthStore((state) => state.updateUser)
  const user = useAuthStore((state) => state.user)
  const [isCheckingTrack, setIsCheckingTrack] = useState(true)
  const [isSavingTrack, setIsSavingTrack] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const profile = await getFellowMe()
        updateUser({
          full_name: profile.fullName,
          email: profile.email,
          role: profile.role,
          selectedTrack: profile.selectedTrack,
          learningTrack: profile.learningTrack,
        })

        if (profile.selectedTrack) {
          navigate('/fellow/dashboard', { replace: true })
        }
      } catch {
        if (isMounted) {
          setError('Unable to verify your fellow profile.')
        }
      } finally {
        if (isMounted) {
          setIsCheckingTrack(false)
        }
      }
    }

    if (user?.selectedTrack || user?.learningTrack) {
      navigate('/fellow/dashboard', { replace: true })
      return undefined
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [navigate, updateUser, user?.learningTrack, user?.selectedTrack])

  const handleSelectTrack = async (selectedTrack) => {
    setIsSavingTrack(true)
    setError('')

    try {
      const profile = await selectFellowTrack(selectedTrack)
      updateUser({
        full_name: profile.fullName,
        email: profile.email,
        role: profile.role,
        selectedTrack: profile.selectedTrack,
        learningTrack: profile.learningTrack,
      })
      navigate('/fellow/dashboard', { replace: true })
    } catch (selectionError) {
      const detail = selectionError?.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to save your learning track.',
      )
    } finally {
      setIsSavingTrack(false)
    }
  }

  return (
    <section className="track-selection-shell">
      <div className="track-selection-heading">
        <p className="eyebrow">Learning Track</p>
        <h1>Select your fellowship track</h1>
        <p>
          Choose the one path you will follow through your dashboard, quizzes,
          assignments, and learning modules. This can only be selected once.
        </p>
      </div>

      {error ? <p className="dashboard-alert">{error}</p> : null}

      {isCheckingTrack ? (
        <p className="track-selection-loading">Loading track options...</p>
      ) : (
        <div className="track-selection-grid">
          {LEARNING_TRACK_OPTIONS.map((track) => (
            <TrackSelectionCard
              key={track.value}
              track={track}
              isSaving={isSavingTrack}
              onSelect={handleSelectTrack}
            />
          ))}
        </div>
      )}
    </section>
  )
}
