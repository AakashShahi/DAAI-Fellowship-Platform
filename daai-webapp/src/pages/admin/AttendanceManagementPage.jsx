import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AttendanceTable from '../../components/sessions/AttendanceTable'
import { getAdminSession, getAdminSessionAttendance, updateAdminSessionAttendance } from '../../services/sessionService'

export default function AttendanceManagementPage() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true
    Promise.all([getAdminSession(sessionId), getAdminSessionAttendance(sessionId)])
      .then(([sessionData, attendanceData]) => {
        if (!isMounted) return
        setSession(sessionData)
        setRows(attendanceData)
      })
      .catch(() => { if (isMounted) setError('Unable to load attendance.') })
    return () => { isMounted = false }
  }, [sessionId])

  const updateRow = (fellowId, patch) => {
    setRows((current) => current.map((row) => row.fellowId === fellowId ? { ...row, ...patch } : row))
  }

  const save = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await updateAdminSessionAttendance(sessionId, rows.map((row) => ({
        fellowId: row.fellowId,
        status: row.status === 'not-marked' ? 'present' : row.status,
        remarks: row.remarks ?? '',
      })))
      setRows(updated)
      setSuccess('Attendance saved.')
    } catch (err) {
      setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Unable to save attendance.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section>
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <Link className="text-sm font-black text-[#4f46e5]" to={session ? `/admin/sessions/${session.id}` : '/admin/sessions'}>Session Detail</Link>
        <h1 className="mt-2 text-3xl font-black text-[#0f172a]">{session?.title ?? 'Attendance'}</h1>
        {session ? <p className="mt-2 text-sm font-bold text-[#475569]">{new Date(session.sessionDate).toLocaleDateString()} · {session.startTime} - {session.endTime}</p> : null}
      </div>
      {error ? <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {success ? <p className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">{success}</p> : null}
      <AttendanceTable rows={rows} onChange={updateRow} editable />
      <button className="mt-5 min-h-11 rounded-md bg-[#4f46e5] px-5 text-sm font-black text-white disabled:opacity-60" disabled={isSaving || session?.status === 'archived'} onClick={save} type="button">{isSaving ? 'Saving...' : 'Save Attendance'}</button>
    </section>
  )
}
