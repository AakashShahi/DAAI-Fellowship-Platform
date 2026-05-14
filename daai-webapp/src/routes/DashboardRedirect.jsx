import { Navigate } from 'react-router-dom'
import UnauthorizedPage from '../pages/UnauthorizedPage'
import useAuthStore from '../store/authStore'

const ROLE_DASHBOARD_PATHS = {
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
  TRAINER: '/trainer/dashboard',
  FELLOW: '/fellow/dashboard',
  EMPLOYER: '/employer/dashboard',
}

export default function DashboardRedirect() {
  const user = useAuthStore((state) => state.user)
  const dashboardPath = ROLE_DASHBOARD_PATHS[user?.role]

  if (!dashboardPath) {
    return <UnauthorizedPage />
  }

  return <Navigate to={dashboardPath} replace />
}
