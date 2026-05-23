import { Link } from 'react-router-dom'
import CohortStatusBadge from './CohortStatusBadge'
import TrackBadge from './TrackBadge'

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not set'

export default function CohortTable({ cohorts, onArchive, isBusy }) {
  if (cohorts.length === 0) {
    return (
      <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold text-[#6f5f57]">
        No cohorts match these filters.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-orange-100 bg-white shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-orange-100 text-left text-sm">
          <thead className="bg-[#fff8f3] text-xs font-black uppercase tracking-wide text-[#6f5f57]">
            <tr>
              <th className="px-4 py-3">Cohort name</th>
              <th className="px-4 py-3">Track</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Start date</th>
              <th className="px-4 py-3">End date</th>
              <th className="px-4 py-3">Fellows</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100">
            {cohorts.map((cohort) => (
              <tr key={cohort.id}>
                <td className="px-4 py-4 font-black text-[#24140e]">
                  {cohort.name}
                </td>
                <td className="px-4 py-4">
                  <TrackBadge selectedTrack={cohort.track} />
                </td>
                <td className="px-4 py-4">
                  <CohortStatusBadge status={cohort.status} />
                </td>
                <td className="px-4 py-4 font-medium text-[#6f5f57]">
                  {formatDate(cohort.startDate)}
                </td>
                <td className="px-4 py-4 font-medium text-[#6f5f57]">
                  {formatDate(cohort.endDate)}
                </td>
                <td className="px-4 py-4 font-black text-[#24140e]">
                  {cohort.fellowsCount ?? cohort.fellows?.length ?? 0}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex min-h-10 items-center rounded-md bg-[#f26322] px-3 text-sm font-black text-white transition hover:bg-[#d94f13]"
                      to={`/admin/cohorts/${cohort.id}`}
                    >
                      Manage
                    </Link>
                    <button
                      type="button"
                      className="min-h-10 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isBusy || cohort.status === 'archived'}
                      onClick={() => onArchive(cohort)}
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
