import { Navigate } from 'react-router-dom'
import { ROLE_DASHBOARD_PATHS } from '../constants/roles'
import UnauthorizedPage from '../pages/UnauthorizedPage'
import useAuthStore from '../store/authStore'

export default function DashboardRedirect() {
  const user = useAuthStore((state) => state.user)
  const dashboardPath = ROLE_DASHBOARD_PATHS[user?.role]

  if (!dashboardPath) {
    return <UnauthorizedPage />
  }

  return <Navigate to={dashboardPath} replace />
}
