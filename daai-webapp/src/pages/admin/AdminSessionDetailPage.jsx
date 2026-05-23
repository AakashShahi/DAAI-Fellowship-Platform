import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TrackBadge from '../../components/admin/TrackBadge'
import SessionStatusBadge from '../../components/sessions/SessionStatusBadge'
import { getAdminSession } from '../../services/sessionService'

export default function AdminSessionDetailPage() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    getAdminSession(sessionId)
      .then((data) => { if (isMounted) setSession(data) })
      .catch(() => { if (isMounted) setError('Unable to load session.') })
    return () => { isMounted = false }
  }, [sessionId])

  if (!session) return <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">{error || 'Loading session...'}</p>

  return (
    <section>
      <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">Session Detail</p>
            <h1 className="mt-2 text-3xl font-black text-[#24140e]">{session.title}</h1>
            <p className="mt-2 text-sm font-medium text-[#6f5f57]">{session.description || 'No description.'}</p>
          </div>
          <div className="flex flex-wrap gap-2"><TrackBadge track={session.track} /><SessionStatusBadge status={session.status} /></div>
        </div>
        <div className="mt-6 grid gap-3 text-sm font-bold text-[#6f5f57] md:grid-cols-3">
          <p>Cohort: {session.cohortName}</p>
          <p>Date: {new Date(session.sessionDate).toLocaleDateString()}</p>
          <p>Time: {session.startTime} - {session.endTime}</p>
          <p>Attendance marked: {session.attendanceMarkedCount}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {session.meetingLink ? <a className="rounded-md border border-orange-100 px-4 py-2 text-sm font-black text-[#f26322]" href={session.meetingLink} target="_blank" rel="noreferrer">Meeting Link</a> : null}
          {session.recordingLink ? <a className="rounded-md border border-orange-100 px-4 py-2 text-sm font-black text-[#f26322]" href={session.recordingLink} target="_blank" rel="noreferrer">Recording Link</a> : null}
          <Link className="rounded-md bg-[#f26322] px-4 py-2 text-sm font-black text-white" to={`/admin/sessions/${session.id}/attendance`}>Manage Attendance</Link>
          <Link className="rounded-md border border-orange-100 px-4 py-2 text-sm font-black text-[#f26322]" to={`/admin/sessions/${session.id}/edit`}>Edit Session</Link>
        </div>
      </div>
    </section>
  )
}
