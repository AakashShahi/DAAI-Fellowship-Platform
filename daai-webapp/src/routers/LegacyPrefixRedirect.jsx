import { Navigate, useLocation } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import useAuthStore from '../store/authStore'

export default function LegacyPrefixRedirect({
  from,
  to,
  fellowOnly = false,
}) {
  const { pathname, search, hash } = useLocation()
  const role = useAuthStore((state) => state.user?.role)

  if (!pathname.startsWith(from)) {
    return <Navigate to="/dashboard" replace />
  }

  if (fellowOnly && role !== ROLES.FELLOW) {
    return <Navigate to="/dashboard" replace />
  }

  const rest = pathname.slice(from.length)
  const nextPath = rest ? `${to}${rest}` : to

  return <Navigate to={`${nextPath}${search}${hash}`} replace />
}
