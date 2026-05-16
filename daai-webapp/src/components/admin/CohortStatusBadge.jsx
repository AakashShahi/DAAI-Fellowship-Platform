import { getCohortStatusLabel } from '../../constants/cohortStatuses'

const statusClasses = {
  upcoming: 'bg-blue-50 text-blue-700',
  active: 'bg-green-50 text-green-700',
  completed: 'bg-slate-100 text-slate-700',
  archived: 'bg-red-50 text-red-700',
}

export default function CohortStatusBadge({ status }) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-3 py-1 text-xs font-black',
        statusClasses[status] ?? 'bg-slate-100 text-slate-700',
      ].join(' ')}
    >
      {getCohortStatusLabel(status)}
    </span>
  )
}
