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
    <article className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#24140e]">{cohort.name}</h2>
          <p className="mt-2 text-sm font-medium text-[#6f5f57]">
            {getFellowTrackLabel(cohort.track)}
          </p>
        </div>
        <CohortStatusBadge status={cohort.status} />
      </div>
      <p className="mt-4 text-sm font-medium text-[#6f5f57]">
        {cohort.description || 'No description added.'}
      </p>
      <div className="mt-4 grid gap-3 text-sm font-bold text-[#6f5f57] sm:grid-cols-2">
        <p>Start: {formatDate(cohort.startDate)}</p>
        <p>End: {formatDate(cohort.endDate)}</p>
        <p>Fellows: {cohort.fellowsCount ?? cohort.fellows?.length ?? 0}</p>
        <p>
          Track: <TrackBadge selectedTrack={cohort.track} />
        </p>
      </div>
      <Link
        className="mt-5 inline-flex min-h-10 items-center rounded-md bg-[#f26322] px-4 text-sm font-black text-white transition hover:bg-[#d94f13]"
        to={`/admin/cohorts/${cohort.id}`}
      >
        Manage Cohort
      </Link>
    </article>
  )
}
