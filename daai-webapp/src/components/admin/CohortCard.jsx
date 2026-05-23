import { Link } from 'react-router-dom'
import { getFellowTrackLabel } from '../../constants/fellowTracks'
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

export default function CohortCard({ cohort }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#0f172a]">{cohort.name}</h2>
          <p className="mt-2 text-sm font-medium text-[#475569]">
            {getFellowTrackLabel(cohort.track)}
          </p>
        </div>
        <CohortStatusBadge status={cohort.status} />
      </div>
      <p className="mt-4 text-sm font-medium text-[#475569]">
        {cohort.description || 'No description added.'}
      </p>
      <div className="mt-4 grid gap-3 text-sm font-bold text-[#475569] sm:grid-cols-2">
        <p>Start: {formatDate(cohort.startDate)}</p>
        <p>End: {formatDate(cohort.endDate)}</p>
        <p>Fellows: {cohort.fellowsCount ?? cohort.fellows?.length ?? 0}</p>
        <p>
          Track: <TrackBadge selectedTrack={cohort.track} />
        </p>
      </div>
      <Link
        className="mt-5 inline-flex min-h-10 items-center rounded-md bg-[#4f46e5] px-4 text-sm font-black text-white transition hover:bg-[#4338ca]"
        to={`/admin/cohorts/${cohort.id}`}
      >
        Manage Cohort
      </Link>
    </article>
  )
}
