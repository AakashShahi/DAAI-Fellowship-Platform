import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AttendanceStatusBadge from '../../components/sessions/AttendanceStatusBadge'
import SessionStatusBadge from '../../components/sessions/SessionStatusBadge'
import { getFellowAttendance, getFellowSession } from '../../services/sessionService'

export default function FellowSessionDetailPage() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    Promise.all([getFellowSession(sessionId), getFellowAttendance()])
      .then(([sessionData, attendanceData]) => {
        if (!isMounted) return
        setSession(sessionData)
        setAttendance(attendanceData)
      })
      .catch((err) => { if (isMounted) setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Unable to load session.') })
    return () => { isMounted = false }
  }, [sessionId])

  const attendanceRow = useMemo(() => attendance.find((row) => row.sessionId === sessionId), [attendance, sessionId])

  if (!session) return <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">{error || 'Loading session...'}</p>

  return (
    <section>
      <Link className="text-sm font-black text-[#f26322]" to="/fellow/sessions">Sessions</Link>
      <div className="mt-4 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#24140e]">{session.title}</h1>
            <p className="mt-2 text-sm font-medium text-[#6f5f57]">{session.description || 'No description.'}</p>
          </div>
          <SessionStatusBadge status={session.status} />
        </div>
        <div className="mt-5 grid gap-3 text-sm font-bold text-[#6f5f57] md:grid-cols-3">
          <p>Date: {new Date(session.sessionDate).toLocaleDateString()}</p>
          <p>Time: {session.startTime} - {session.endTime}</p>
          <p className="flex items-center gap-2">Attendance: <AttendanceStatusBadge status={attendanceRow?.status ?? 'not-marked'} /></p>
        </div>
        {attendanceRow?.remarks ? <p className="mt-4 text-sm text-[#6f5f57]">Remarks: {attendanceRow.remarks}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {session.meetingLink ? <a className="rounded-md bg-[#f26322] px-4 py-2 text-sm font-black text-white" href={session.meetingLink} target="_blank" rel="noreferrer">Join Session</a> : null}
          {session.recordingLink ? <a className="rounded-md border border-orange-100 px-4 py-2 text-sm font-black text-[#f26322]" href={session.recordingLink} target="_blank" rel="noreferrer">Recording</a> : null}
        </div>
      </div>
    </section>
  )
}
