import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import Spinner from '@/components/ui/Spinner'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ redirect: location.pathname }}
        replace
      />
    )
  }

  return children
}
