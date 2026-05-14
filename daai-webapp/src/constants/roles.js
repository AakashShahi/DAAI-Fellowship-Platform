export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TRAINER: 'TRAINER',
  MENTOR: 'MENTOR',
  FELLOW: 'FELLOW',
  EMPLOYER: 'EMPLOYER',
}

export const ROLE_DASHBOARD_PATHS = {
  [ROLES.SUPER_ADMIN]: '/admin/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.TRAINER]: '/trainer/dashboard',
  [ROLES.MENTOR]: '/mentor/dashboard',
  [ROLES.FELLOW]: '/fellow/dashboard',
  [ROLES.EMPLOYER]: '/employer/dashboard',
}
