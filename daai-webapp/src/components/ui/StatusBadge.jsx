import Badge from './Badge'

const STATUS_TONES = {
  active: 'success',
  published: 'success',
  completed: 'success',
  reviewed: 'success',
  present: 'success',
  scheduled: 'info',
  draft: 'warning',
  pending: 'warning',
  upcoming: 'info',
  late: 'warning',
  absent: 'danger',
  cancelled: 'danger',
  archived: 'default',
  default: 'default',
}

export default function StatusBadge({ status, className }) {
  const normalized = String(status ?? '')
    .toLowerCase()
    .replace(/\s+/g, '_')
  const tone = STATUS_TONES[normalized] ?? STATUS_TONES.default
  const label = String(status ?? '—')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <Badge tone={tone} className={className}>
      {label}
    </Badge>
  )
}
