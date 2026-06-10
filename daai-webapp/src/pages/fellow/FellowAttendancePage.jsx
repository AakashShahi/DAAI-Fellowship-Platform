import { useEffect, useState } from 'react'
import AttendanceSummaryCard from '../../components/sessions/AttendanceSummaryCard'
import AttendanceStatusBadge from '../../components/sessions/AttendanceStatusBadge'
import { getFellowAttendance, getFellowAttendanceSummary } from '../../services/sessionService'

export default function FellowAttendancePage() {
  const [summary, setSummary] = useState(null)
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    Promise.all([getFellowAttendanceSummary(), getFellowAttendance()])
      .then(([summaryData, attendanceData]) => {
        if (!isMounted) return
        setSummary(summaryData)
        setRows(attendanceData)
      })
      .catch((err) => { if (isMounted) setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Unable to load attendance.') })
      .finally(() => { if (isMounted) setIsLoading(false) })
    return () => { isMounted = false }
  }, [])

  return (
    <section>
      <AttendanceSummaryCard summary={summary} />
      {error ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {isLoading ? <p className="mt-5 rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">Loading attendance...</p> : (
        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#fff7f1] text-xs font-black uppercase tracking-wide text-[#475569]">
                <tr><th className="px-4 py-3">Session</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Remarks</th><th className="px-4 py-3">Marked At</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row) => (
                  <tr key={row.sessionId}>
                    <td className="px-4 py-4 font-black text-[#0f172a]">{row.sessionTitle}</td>
                    <td className="px-4 py-4 text-[#475569]">{new Date(row.sessionDate).toLocaleDateString()}</td>
                    <td className="px-4 py-4"><AttendanceStatusBadge status={row.status} /></td>
                    <td className="px-4 py-4 text-[#475569]">{row.remarks || '—'}</td>
                    <td className="px-4 py-4 text-[#475569]">{row.markedAt ? new Date(row.markedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
