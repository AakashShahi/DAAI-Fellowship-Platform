export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  HR: 'HR',
  FELLOW: 'FELLOW',
  EMPLOYER: 'EMPLOYER',
}

export const ROLE_DASHBOARD_PATHS = {
  [ROLES.SUPER_ADMIN]: '/admin/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.INSTRUCTOR]: '/instructor/dashboard',
  [ROLES.HR]: '/hr/dashboard',
  [ROLES.FELLOW]: '/fellow/dashboard',
  [ROLES.EMPLOYER]: '/employer/dashboard',
}
