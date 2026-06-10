import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SessionTable from '../../components/sessions/SessionTable'
import { SESSION_STATUS_OPTIONS } from '../../constants/sessions'
import { FELLOW_TRACK_OPTIONS } from '../../constants/fellowTracks'
import { archiveAdminSession, getAdminSessions } from '../../services/sessionService'
import { getAdminCohorts } from '../../services/cohortService'

const getErrorMessage = (error, fallback) =>
  typeof error?.response?.data?.detail === 'string' ? error.response.data.detail : fallback

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [cohorts, setCohorts] = useState([])
  const [filters, setFilters] = useState({ track: '', cohortId: '', status: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    Promise.all([getAdminSessions(filters), getAdminCohorts()])
      .then(([sessionData, cohortData]) => {
        if (!isMounted) return
        setSessions(sessionData)
        setCohorts(cohortData)
      })
      .catch((err) => {
        if (isMounted) setError(getErrorMessage(err, 'Unable to load sessions.'))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => { isMounted = false }
  }, [filters])

  const archiveSession = async (session) => {
    if (!window.confirm(`Archive "${session.title}"?`)) return
    setIsBusy(true)
    setError('')
    try {
      const archived = await archiveAdminSession(session.id)
      setSessions((current) => current.map((item) => item.id === archived.id ? archived : item))
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to archive session.'))
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <section>
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">Sessions</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a]">Session Management</h1>
            <p className="mt-2 text-sm font-medium text-[#475569]">Create cohort sessions and track attendance.</p>
          </div>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#4f46e5] px-4 text-sm font-black text-white" to="/admin/sessions/new">Create Session</Link>
        </div>
      </div>
      {error ? <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
        <select className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold" value={filters.track} onChange={(event) => setFilters((current) => ({ ...current, track: event.target.value }))}>
          <option value="">All tracks</option>
          {FELLOW_TRACK_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold" value={filters.cohortId} onChange={(event) => setFilters((current) => ({ ...current, cohortId: event.target.value }))}>
          <option value="">All cohorts</option>
          {cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}
        </select>
        <select className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
          <option value="">All statuses</option>
          {SESSION_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
      {isLoading ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">Loading sessions...</p> : <SessionTable sessions={sessions} onArchive={archiveSession} isBusy={isBusy} />}
    </section>
  )
}
