import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  Cloud,
  Download,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  TestTube2,
  Users,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { ErrorState, LoadingState } from '../../components/admin/AdminStates'
import FellowsTable from '../../components/admin/FellowsTable'
import TrackFilter from '../../components/admin/TrackFilter'
import Button from '../../components/ui/Button'
import {
  getAdminFellowProfile,
  getAdminFellows,
  getAdminTrackStats,
  updateAdminFellowTrack,
} from '../../services/adminFellowService'
import { getFellowTrackLabel } from '../../constants/fellowTracks'

const PAGE_SIZE = 10

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
  const [currentPage, setCurrentPage] = useState(1)
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
  const totalPages = Math.max(1, Math.ceil(filteredFellows.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStartIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const paginatedFellows = filteredFellows.slice(
    pageStartIndex,
    pageStartIndex + PAGE_SIZE,
  )
  const showingStart = filteredFellows.length ? pageStartIndex + 1 : 0
  const showingEnd = Math.min(pageStartIndex + PAGE_SIZE, filteredFellows.length)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, trackFilter])

  const exportFellowsCsv = () => {
    const headers = ['Name', 'Email', 'Track', 'Status', 'Joined Date']
    const rows = filteredFellows.map((fellow) => [
      fellow.fullName,
      fellow.email,
      getFellowTrackLabel(fellow.selectedTrack),
      fellow.status ?? 'Active',
      fellow.createdAt ? new Date(fellow.createdAt).toLocaleDateString() : '',
    ])
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'fellows.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

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
        compact
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

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <FellowStatCard
          label="Total Fellows"
          value={stats?.totalFellows ?? fellows.length}
          icon={Users}
          tone="slate"
        />
        <FellowStatCard
          label="Active Fellows"
          value={stats?.activeFellows ?? '-'}
          icon={CheckCircle2}
          tone="emerald"
        />
        <FellowStatCard
          label="QA Track"
          value={stats?.tracks?.qa ?? 0}
          icon={TestTube2}
          tone="purple"
        />
        <FellowStatCard
          label="AWS Track"
          value={(stats?.tracks?.['aws-practitioner'] ?? 0) + (stats?.tracks?.['aws-architect'] ?? 0)}
          icon={Cloud}
          tone="sky"
        />
        <FellowStatCard
          label="Salesforce Track"
          value={stats?.tracks?.salesforce ?? 0}
          icon={ShieldCheck}
          tone="green"
        />
        <FellowStatCard
          label="Pending"
          value={stats?.unassigned ?? 0}
          icon={Clock3}
          tone="amber"
        />
      </div>

      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <label className="w-full text-sm font-bold text-[#0f172a] lg:max-w-xl">
            Search fellows
            <span className="mt-2 flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[#475569] focus-within:border-[#4f46e5]">
              <Search className="h-4 w-4" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none"
                type="search"
                placeholder="Search by name, email, or track..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                disabled={isLoading || isUpdating}
              />
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportFellowsCsv} disabled={isLoading}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button disabled>
              <Plus className="h-4 w-4" />
              Add Fellow
            </Button>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-[#475569]">
          Showing {filteredFellows.length} of {fellows.length} fellows
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading fellows..." />
      ) : (
        <FellowsTable
          key={`${trackFilter}-${fellows.map((fellow) => `${fellow.id}:${fellow.selectedTrack ?? ''}`).join('|')}`}
          fellows={paginatedFellows}
          selectedFellowProfile={selectedFellowProfile}
          isProfileLoading={isProfileLoading}
          isUpdating={isUpdating}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          showingStart={showingStart}
          showingEnd={showingEnd}
          totalItems={filteredFellows.length}
          onPageChange={setCurrentPage}
          onCloseProfile={() => setSelectedFellowProfile(null)}
          onViewProfile={handleViewProfile}
          onChangeTrack={handleChangeTrack}
          onResetTrack={handleResetTrack}
        />
      )}
    </section>
  )
}

function FellowStatCard({ label, value, icon: Icon, tone }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <article className="min-h-32 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black text-slate-900">{value}</p>
    </article>
  )
}
