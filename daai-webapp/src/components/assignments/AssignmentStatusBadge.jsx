import { getAssignmentStatusLabel } from '../../constants/assignments'

const classes = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-green-50 text-green-700',
  archived: 'bg-red-50 text-red-700',
}

export default function AssignmentStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${classes[status] ?? classes.draft}`}>
      {getAssignmentStatusLabel(status)}
    </span>
  )
}
