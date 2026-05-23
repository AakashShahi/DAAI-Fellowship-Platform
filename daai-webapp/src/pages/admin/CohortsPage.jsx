import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Plus, RefreshCcw } from 'lucide-react'
import CohortTable from '../../components/admin/CohortTable'
import Button from '../../components/ui/Button'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import { ADMIN_COHORT_STATUS_FILTER_OPTIONS } from '../../constants/cohortStatuses'
import { FELLOW_TRACK_OPTIONS } from '../../constants/fellowTracks'
import {
  archiveAdminCohort,
  getAdminCohorts,
} from '../../services/cohortService'

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState([])
  const [trackFilter, setTrackFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')

  const loadCohorts = async (isMounted = true) => {
    setIsLoading(true)
    setError('')

    try {
      const data = await getAdminCohorts({
        ...(trackFilter ? { track: trackFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      })
      if (isMounted) {
        setCohorts(data)
      }
    } catch (loadError) {
      if (isMounted) {
        setError(getErrorMessage(loadError, 'Failed to load cohorts.'))
      }
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    let isMounted = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCohorts(isMounted)

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackFilter, statusFilter])

  const handleArchive = async (cohort) => {
    const confirmed = window.confirm(`Archive ${cohort.name}?`)
    if (!confirmed) {
      return
    }

    setIsBusy(true)
    setError('')
    try {
      await archiveAdminCohort(cohort.id)
      setCohorts((current) =>
        current.map((item) =>
          item.id === cohort.id ? { ...item, status: 'archived' } : item,
        ),
      )
    } catch (archiveError) {
      setError(getErrorMessage(archiveError, 'Unable to archive cohort.'))
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <section className="space-y-6">
      <Card padding={false}>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Cohorts
              </p>
              <CardTitle className="mt-2 text-3xl">Program Cohorts</CardTitle>
              <CardDescription className="mt-3 max-w-2xl">
                Create cohorts, track timelines, and manage fellow assignments by
                selected learning track.
              </CardDescription>
            </div>
            <Button asChild>
              <Link to="/admin/cohorts/new">
                <Plus className="h-4 w-4" />
                Create Cohort
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Track Filter"
              name="trackFilter"
              value={trackFilter}
              onChange={(event) => {
                setTrackFilter(event.target.value)
              }}
              disabled={isLoading || isBusy}
            >
              <option value="">All tracks</option>
              {FELLOW_TRACK_OPTIONS.map((track) => (
                <option key={track.value} value={track.value}>
                  {track.label}
                </option>
              ))}
            </Select>

            <Select
              label="Status Filter"
              name="statusFilter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
              }}
              disabled={isLoading || isBusy}
            >
              {ADMIN_COHORT_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-red-700">
              Failed to load cohorts.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadCohorts()}
              disabled={isLoading}
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          {error !== 'Failed to load cohorts.' ? (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          ) : null}
        </Card>
      ) : null}

      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-10 text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading cohorts...
          </div>
        </Card>
      ) : cohorts.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-lg font-semibold text-slate-900">
              No cohorts found
            </p>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Create your first cohort to organize fellows by track and timeline.
            </p>
            <Button asChild className="mt-5">
              <Link to="/admin/cohorts/new">
                <Plus className="h-4 w-4" />
                Create Cohort
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <CohortTable
          cohorts={cohorts}
          onArchive={handleArchive}
          isBusy={isBusy}
        />
      )}
    </section>
  )
}
