import { useEffect, useState } from 'react'
import { RefreshCcw, Search } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { ErrorState, LoadingState } from '../../components/admin/AdminStates'
import FellowsTable from '../../components/admin/FellowsTable'
import StatCard from '../../components/admin/StatCard'
import TrackFilter from '../../components/admin/TrackFilter'
import Button from '../../components/ui/Button'
import {
  getAdminFellowProfile,
  getAdminFellows,
  getAdminTrackStats,
  updateAdminFellowTrack,
} from '../../services/adminFellowService'
import { getFellowTrackLabel } from '../../constants/fellowTracks'

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  return fallback
}

export default function FellowsPage() {
  const [fellows, setFellows] = useState([])
  const [stats, setStats] = useState(null)
  const [trackFilter, setTrackFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFellowProfile, setSelectedFellowProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
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
    const [data, statsData] = await Promise.all([
      getAdminFellows(trackFilter),
      getAdminTrackStats(),
    ])
    setFellows(data)
    setStats(statsData)
  }

  useEffect(() => {
    let isMounted = true

    getAdminTrackStats()
      .then((data) => {
        if (isMounted) {
          setStats(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setStats(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredFellows = fellows.filter((fellow) => {
    const searchValue = searchTerm.trim().toLowerCase()

    if (!searchValue) {
      return true
    }

    return [
      fellow.fullName,
      fellow.email,
      getFellowTrackLabel(fellow.selectedTrack),
      fellow.selectedTrack,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchValue))
  })

  const handleViewProfile = async (fellow) => {
    setIsProfileLoading(true)
    setError('')

    try {
      const data = await getAdminFellowProfile(fellow.id)
      setSelectedFellowProfile(data)
    } catch (profileError) {
      setError(getErrorMessage(profileError, 'Unable to load fellow profile.'))
    } finally {
      setIsProfileLoading(false)
    }
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

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Fellows" value={stats?.totalFellows ?? fellows.length} />
        <StatCard label="Active Fellows" value={stats?.activeFellows ?? '-'} />
        <StatCard label="QA Track" value={stats?.tracks?.qa ?? 0} />
        <StatCard
          label="AWS Track"
          value={(stats?.tracks?.['aws-practitioner'] ?? 0) + (stats?.tracks?.['aws-architect'] ?? 0)}
        />
        <StatCard label="Salesforce Track" value={stats?.tracks?.salesforce ?? 0} />
        <StatCard label="Pending" value={stats?.unassigned ?? 0} />
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <label className="flex-1 text-sm font-bold text-[#0f172a]">
          Search fellows
          <span className="mt-2 flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[#475569] focus-within:border-[#4f46e5]">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm font-medium outline-none"
              type="search"
              placeholder="Search by name, email, or track"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              disabled={isLoading || isUpdating}
            />
          </span>
        </label>
        <p className="text-sm font-bold text-[#475569]">
          Showing {filteredFellows.length} of {fellows.length} fellows
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading fellows..." />
      ) : (
        <FellowsTable
          key={`${trackFilter}-${fellows.map((fellow) => `${fellow.id}:${fellow.selectedTrack ?? ''}`).join('|')}`}
          fellows={filteredFellows}
          selectedFellowProfile={selectedFellowProfile}
          isProfileLoading={isProfileLoading}
          isUpdating={isUpdating}
          onCloseProfile={() => setSelectedFellowProfile(null)}
          onViewProfile={handleViewProfile}
          onChangeTrack={handleChangeTrack}
          onResetTrack={handleResetTrack}
        />
      )}
    </section>
  )
}
