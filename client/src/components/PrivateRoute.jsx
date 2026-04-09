import { Navigate, useLocation } from 'react-router'
import useAuthStore, { isTokenValid } from '../stores/authStore'

export default function PrivateRoute({ children }) {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()
  const isAuthenticated = isTokenValid(token)

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
