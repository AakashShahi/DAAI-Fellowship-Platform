import Badge from '../ui/Badge'

const ROLE_CONFIG = {
  SUPER_ADMIN: { label: 'Super Admin', tone: 'danger' },
  ADMIN: { label: 'Admin', tone: 'purple' },
  TRAINER: { label: 'Instructor', tone: 'info' },
  MENTOR: { label: 'HR', tone: 'warning' },
  FELLOW: { label: 'Fellow', tone: 'success' },
  EMPLOYER: { label: 'Employer', tone: 'default' },
}

export function getRoleLabel(role) {
  return ROLE_CONFIG[role]?.label ?? role
}

export default function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] ?? { label: role, tone: 'default' }

  return <Badge tone={config.tone}>{config.label}</Badge>
}
