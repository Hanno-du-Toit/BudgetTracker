import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { ROUTES } from '@/constants/routes'
import AuthGuard from '@/components/auth/AuthGuard'
import ToastContainer from '@/components/ui/ToastContainer'
import Spinner from '@/components/ui/Spinner'

const LandingPage        = lazy(() => import('@/pages/LandingPage'))
const LoginPage          = lazy(() => import('@/pages/LoginPage'))
const SignupPage         = lazy(() => import('@/pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('@/pages/ResetPasswordPage'))
const DashboardPage      = lazy(() => import('@/pages/DashboardPage'))
const UploadPage         = lazy(() => import('@/pages/UploadPage'))
const TransactionsPage   = lazy(() => import('@/pages/TransactionsPage'))
const CategoryPage       = lazy(() => import('@/pages/CategoryPage'))
const SettingsPage       = lazy(() => import('@/pages/SettingsPage'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  )
}

// AnimatePresence must be inside BrowserRouter so useLocation is available
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path={ROUTES.HOME}            element={<LandingPage />} />
        <Route path={ROUTES.LOGIN}           element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP}          element={<SignupPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD}  element={<ResetPasswordPage />} />

        {/* Protected */}
        <Route path={ROUTES.DASHBOARD}    element={<AuthGuard><DashboardPage /></AuthGuard>} />
        <Route path={ROUTES.UPLOAD}       element={<AuthGuard><UploadPage /></AuthGuard>} />
        <Route path={ROUTES.TRANSACTIONS} element={<AuthGuard><TransactionsPage /></AuthGuard>} />
        <Route path={ROUTES.CATEGORY}     element={<AuthGuard><CategoryPage /></AuthGuard>} />
        <Route path={ROUTES.SETTINGS}     element={<AuthGuard><SettingsPage /></AuthGuard>} />

        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <AnimatedRoutes />
          </Suspense>
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
