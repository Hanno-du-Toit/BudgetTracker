import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'

function AppSkeleton() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      {/* Top bar */}
      <div className="h-14 border-b border-white/5 bg-surface/80 flex items-center px-4 gap-3">
        <div className="w-6 h-6 bg-white/[0.06] rounded-lg shrink-0" />
        <div className="w-28 h-3 bg-white/[0.06] rounded-full hidden sm:block" />
        <div className="flex-1" />
        <div className="w-20 h-3 bg-white/[0.04] rounded-full hidden md:block" />
        <div className="w-8 h-8 bg-white/[0.06] rounded-full shrink-0" />
      </div>
      {/* Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="h-5 w-32 bg-white/[0.06] rounded-full mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/[0.03] rounded-2xl border border-white/[0.03]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-white/[0.03] rounded-2xl border border-white/[0.03]" />
          ))}
        </div>
      </div>
      {/* Bottom nav skeleton on mobile */}
      <div className="h-16 border-t border-white/5 bg-surface/80 md:hidden flex items-center justify-around px-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-5 h-5 bg-white/[0.06] rounded-md" />
            <div className="w-10 h-2 bg-white/[0.04] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AppSkeleton />

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
