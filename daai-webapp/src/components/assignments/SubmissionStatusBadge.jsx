import { getSubmissionStatusLabel } from '../../constants/assignments'

const classes = {
  'not-submitted': 'bg-slate-100 text-slate-700',
  submitted: 'bg-blue-50 text-blue-700',
  'under-review': 'bg-amber-50 text-amber-700',
  reviewed: 'bg-green-50 text-green-700',
  'needs-resubmission': 'bg-red-50 text-red-700',
}

export default function SubmissionStatusBadge({ status = 'not-submitted' }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${classes[status] ?? classes['not-submitted']}`}>
      {getSubmissionStatusLabel(status)}
    </span>
  )
}
