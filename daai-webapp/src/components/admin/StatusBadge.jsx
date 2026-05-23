import Badge from '../ui/Badge'

const toneByStatus = {
  active: 'success',
  accepted: 'success',
  enrollment_confirmed: 'success',
  enrolled: 'success',
  published: 'success',
  present: 'success',
  completed: 'default',
  reviewed: 'success',
  submitted: 'default',
  new: 'default',
  draft: 'default',
  pending: 'warning',
  planned: 'info',
  upcoming: 'info',
  under_review: 'info',
  reviewing: 'info',
  test_sent: 'warning',
  more_info: 'warning',
  needs_revision: 'warning',
  late: 'warning',
  shortlisted: 'purple',
  archived: 'danger',
  rejected: 'danger',
  inactive: 'danger',
  cancelled: 'danger',
  withdrawn: 'danger',
  absent: 'danger',
}

const labelByStatus = {
  under_review: 'Under review',
  test_sent: 'Test sent',
  enrollment_confirmed: 'Enrollment confirmed',
  needs_revision: 'Needs revision',
  more_info: 'More info',
}

export default function StatusBadge({ status, children }) {
  const key = String(status || 'draft').toLowerCase()
  const label =
    children ||
    labelByStatus[key] ||
    key
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

  return <Badge tone={toneByStatus[key] || 'default'}>{label}</Badge>
}
