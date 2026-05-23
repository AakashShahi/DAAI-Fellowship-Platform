import { useEffect, useState } from 'react'
import { RefreshCcw } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { ErrorState, LoadingState } from '../../components/admin/AdminStates'
import FellowsTable from '../../components/admin/FellowsTable'
import TrackFilter from '../../components/admin/TrackFilter'
import Button from '../../components/ui/Button'
import {
  getAdminFellows,
  updateAdminFellowTrack,
} from '../../services/adminFellowService'

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  return fallback
}

export default function FellowsPage() {
  const [fellows, setFellows] = useState([])
  const [trackFilter, setTrackFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    getAdminFellows(trackFilter)
      .then((data) => {
        if (isMounted) {
          setFellows(data)
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(getErrorMessage(loadError, 'Unable to load fellows.'))
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [trackFilter])

  const refreshFellows = async () => {
    const data = await getAdminFellows(trackFilter)
    setFellows(data)
  }

  const handleChangeTrack = async (fellow, selectedTrack, selectedLabel) => {
    const confirmed = window.confirm(
      `Change ${fellow.fullName}'s track to ${selectedLabel}?`,
    )

    if (!confirmed) {
      return
    }

    setIsUpdating(true)
    setError('')
    setSuccessMessage('')

    try {
      const data = await updateAdminFellowTrack(fellow.id, selectedTrack)
      setSuccessMessage(data.message)
      await refreshFellows()
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Unable to update fellow track.'))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResetTrack = async (fellow) => {
    const confirmed = window.confirm(
      `Reset ${fellow.fullName}'s selected track? They will need to choose again.`,
    )

    if (!confirmed) {
      return
    }

    setIsUpdating(true)
    setError('')
    setSuccessMessage('')

    try {
      const data = await updateAdminFellowTrack(fellow.id, null)
      setSuccessMessage(data.message)
      await refreshFellows()
    } catch (resetError) {
      setError(getErrorMessage(resetError, 'Unable to reset fellow track.'))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <section>
      <AdminPageHeader
        label="Fellows"
        title="Fellow Management"
        description="Manage registered fellows, track assignments, and enrollment status."
        actions={
          <Button variant="outline" onClick={refreshFellows} disabled={isLoading || isUpdating}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        }
      >
        <TrackFilter
          value={trackFilter}
          onChange={(value) => {
            setIsLoading(true)
            setError('')
            setTrackFilter(value)
            setSuccessMessage('')
          }}
          disabled={isLoading || isUpdating}
        />
      </AdminPageHeader>

      {error ? (
        <ErrorState message={error} onRetry={refreshFellows} />
      ) : null}

      {successMessage ? (
        <p className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
          {successMessage}
        </p>
      ) : null}

      {isLoading ? (
        <LoadingState message="Loading fellows..." />
      ) : (
        <FellowsTable
          key={`${trackFilter}-${fellows.map((fellow) => `${fellow.id}:${fellow.selectedTrack ?? ''}`).join('|')}`}
          fellows={fellows}
          isUpdating={isUpdating}
          onChangeTrack={handleChangeTrack}
          onResetTrack={handleResetTrack}
        />
      )}
    </section>
  )
}
