import ProtectedRoute from '../routes/ProtectedRoute'
import RoleBasedRoute from '../routes/RoleBasedRoute'

export const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>

export const protectRole = (allowedRoles, element) =>
  protect(
    <RoleBasedRoute allowedRoles={allowedRoles}>{element}</RoleBasedRoute>,
  )
