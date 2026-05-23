import TrackBadge from '../admin/TrackBadge'
import { ATTENDANCE_STATUS_OPTIONS } from '../../constants/sessions'
import AttendanceStatusBadge from './AttendanceStatusBadge'

export default function AttendanceTable({ rows, onChange, editable = false }) {
  if (!rows.length) {
    return <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-[#475569]">No fellows are assigned to this cohort.</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#fff7f1] text-xs font-black uppercase tracking-wide text-[#475569]">
            <tr>
              <th className="px-4 py-3">Fellow name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Selected Track</th>
              <th className="px-4 py-3">Attendance Status</th>
              <th className="px-4 py-3">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => (
              <tr key={row.fellowId}>
                <td className="px-4 py-4 font-black text-[#0f172a]">{row.fellowName}</td>
                <td className="px-4 py-4 text-[#475569]">{row.email}</td>
                <td className="px-4 py-4"><TrackBadge track={row.selectedTrack} /></td>
                <td className="px-4 py-4">
                  {editable ? (
                    <select className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold" value={row.status === 'not-marked' ? 'present' : row.status} onChange={(event) => onChange(row.fellowId, { status: event.target.value })}>
                      {ATTENDANCE_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : <AttendanceStatusBadge status={row.status} />}
                </td>
                <td className="px-4 py-4">
                  {editable ? (
                    <input className="w-full min-w-48 rounded-md border border-slate-200 px-3 py-2 text-sm" value={row.remarks ?? ''} onChange={(event) => onChange(row.fellowId, { remarks: event.target.value })} />
                  ) : <span className="text-[#475569]">{row.remarks || '—'}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
