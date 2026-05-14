import UnauthorizedPage from '../pages/UnauthorizedPage'
import useAuthStore from '../store/authStore'

export default function RoleBasedRoute({ allowedRoles, children }) {
  const user = useAuthStore((state) => state.user)
  const userRole = user?.role

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <UnauthorizedPage />
  }

  return children
}
