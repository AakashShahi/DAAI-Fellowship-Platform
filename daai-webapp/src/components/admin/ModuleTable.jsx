import { Link } from 'react-router-dom'
import TrackBadge from './TrackBadge'
import ModuleStatusBadge from './ModuleStatusBadge'

export default function ModuleTable({ modules, onArchive, isBusy }) {
  if (modules.length === 0) {
    return (
      <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold text-[#6f5f57]">
        No modules match these filters.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-orange-100 bg-white shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-orange-100 text-left text-sm">
          <thead className="bg-[#fff8f3] text-xs font-black uppercase tracking-wide text-[#6f5f57]">
            <tr>
              <th className="px-4 py-3">Module title</th>
              <th className="px-4 py-3">Track</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Lessons</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100">
            {modules.map((module) => (
              <tr key={module.id}>
                <td className="px-4 py-4 font-black text-[#24140e]">
                  {module.title}
                </td>
                <td className="px-4 py-4">
                  <TrackBadge selectedTrack={module.track} />
                </td>
                <td className="px-4 py-4">
                  <ModuleStatusBadge status={module.status} />
                </td>
                <td className="px-4 py-4 font-black text-[#24140e]">
                  {module.lessonsCount}
                </td>
                <td className="px-4 py-4 font-medium text-[#6f5f57]">
                  {module.order}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex min-h-10 items-center rounded-md bg-[#f26322] px-3 text-sm font-black text-white transition hover:bg-[#d94f13]"
                      to={`/admin/modules/${module.id}`}
                    >
                      Manage
                    </Link>
                    <Link
                      className="inline-flex min-h-10 items-center rounded-md border border-orange-100 px-3 text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
                      to={`/admin/modules/${module.id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="min-h-10 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isBusy || module.status === 'archived'}
                      onClick={() => onArchive(module)}
                    >
                      Archive
                    </button>
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
