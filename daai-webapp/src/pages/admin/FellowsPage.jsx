import { useEffect, useState } from 'react'
import FellowsTable from '../../components/admin/FellowsTable'
import TrackFilter from '../../components/admin/TrackFilter'
import FilterBar from '../../components/ui/FilterBar'
import PageHeader from '../../components/ui/PageHeader'
import Skeleton from '../../components/ui/Skeleton'
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
      <PageHeader
        eyebrow="Admin"
        title="Fellows"
        description="View each fellow's selected learning track and safely update or reset track enrollment when staff need to intervene."
      />

      <FilterBar className="mb-6">
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
      </FilterBar>

      {error ? (
        <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
          {successMessage}
        </p>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
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
