import Badge from '../ui/Badge'
import { getCohortStatusLabel } from '../../constants/cohortStatuses'

const statusTones = {
  upcoming: 'info',
  active: 'success',
  completed: 'default',
  archived: 'danger',
}

export default function CohortStatusBadge({ status }) {
  return (
    <Badge tone={statusTones[status] ?? 'default'}>
      {getCohortStatusLabel(status)}
    </Badge>
  )
}
