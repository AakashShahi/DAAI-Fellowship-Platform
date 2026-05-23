import { Link } from 'react-router-dom'
import TrackBadge from '../admin/TrackBadge'
import SessionStatusBadge from './SessionStatusBadge'

export default function SessionTable({ sessions, onArchive, isBusy }) {
  if (!sessions.length) {
    return <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-[#475569]">No sessions match these filters.</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#fff7f1] text-xs font-black uppercase tracking-wide text-[#475569]">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Cohort</th>
              <th className="px-4 py-3">Track</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sessions.map((session) => (
              <tr key={session.id}>
                <td className="px-4 py-4 font-black text-[#0f172a]">{session.title}</td>
                <td className="px-4 py-4 text-[#475569]">{session.cohortName ?? 'Cohort'}</td>
                <td className="px-4 py-4"><TrackBadge track={session.track} /></td>
                <td className="px-4 py-4 text-[#475569]">{new Date(session.sessionDate).toLocaleDateString()}</td>
                <td className="px-4 py-4 text-[#475569]">{session.startTime} - {session.endTime}</td>
                <td className="px-4 py-4"><SessionStatusBadge status={session.status} /></td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link className="rounded-md bg-[#4f46e5] px-3 py-2 text-xs font-black text-white" to={`/admin/sessions/${session.id}`}>View</Link>
                    <Link className="rounded-md border border-slate-200 px-3 py-2 text-xs font-black text-[#4f46e5]" to={`/admin/sessions/${session.id}/edit`}>Edit</Link>
                    <Link className="rounded-md border border-slate-200 px-3 py-2 text-xs font-black text-[#4f46e5]" to={`/admin/sessions/${session.id}/attendance`}>Attendance</Link>
                    {session.status !== 'archived' ? (
                      <button className="rounded-md border border-red-100 px-3 py-2 text-xs font-black text-red-600 disabled:opacity-60" disabled={isBusy} onClick={() => onArchive(session)} type="button">Archive</button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
