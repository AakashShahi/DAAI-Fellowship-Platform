import { Link } from 'react-router-dom'
import TrackBadge from '../admin/TrackBadge'
import AssignmentStatusBadge from './AssignmentStatusBadge'

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : 'No due date'

export default function AssignmentTable({ assignments, onArchive, isBusy }) {
  if (!assignments.length) {
    return <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-[#475569]">No assignments match these filters.</p>
  }
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-wide text-[#475569]">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Track</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Total Marks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submissions</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td className="px-4 py-4 font-black text-[#0f172a]">{assignment.title}</td>
                <td className="px-4 py-4"><TrackBadge selectedTrack={assignment.track} /></td>
                <td className="px-4 py-4 font-medium text-[#475569]">{assignment.moduleTitle ?? 'Module'}</td>
                <td className="px-4 py-4 font-medium text-[#475569]">{formatDate(assignment.dueDate)}</td>
                <td className="px-4 py-4 font-black text-[#0f172a]">{assignment.totalMarks}</td>
                <td className="px-4 py-4"><AssignmentStatusBadge status={assignment.status} /></td>
                <td className="px-4 py-4 font-black text-[#0f172a]">{assignment.submissionsCount}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link className="rounded-md bg-[#4f46e5] px-3 py-2 text-sm font-black text-white" to={`/admin/assignments/${assignment.id}`}>View</Link>
                    <Link className="rounded-md border border-slate-200 px-3 py-2 text-sm font-black text-[#4f46e5]" to={`/admin/assignments/${assignment.id}/edit`}>Edit</Link>
                    <Link className="rounded-md border border-slate-200 px-3 py-2 text-sm font-black text-[#4f46e5]" to={`/admin/assignments/${assignment.id}/submissions`}>Submissions</Link>
                    <button className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-black text-red-700 disabled:opacity-60" type="button" disabled={isBusy || assignment.status === 'archived'} onClick={() => onArchive(assignment)}>Archive</button>
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
