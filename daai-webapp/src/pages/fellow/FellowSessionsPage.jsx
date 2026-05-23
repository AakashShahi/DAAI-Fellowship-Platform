import { useEffect, useState } from 'react'
import SessionCard from '../../components/sessions/SessionCard'
import { getFellowSessions } from '../../services/sessionService'

export default function FellowSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    getFellowSessions()
      .then((data) => { if (isMounted) setSessions(data) })
      .catch((err) => { if (isMounted) setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Unable to load sessions.') })
      .finally(() => { if (isMounted) setIsLoading(false) })
    return () => { isMounted = false }
  }, [])

  return (
    <section>
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">Sessions</p>
        <h1 className="mt-2 text-3xl font-black text-[#0f172a]">Cohort Sessions</h1>
        <p className="mt-2 text-sm font-medium text-[#475569]">Upcoming and completed sessions for your assigned cohort.</p>
      </div>
      {error ? <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {isLoading ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">Loading sessions...</p> : sessions.length === 0 ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">No sessions scheduled yet.</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => <SessionCard key={session.id} session={session} to={`/fellow/sessions/${session.id}`} />)}
        </div>
      )}
    </section>
  )
}
