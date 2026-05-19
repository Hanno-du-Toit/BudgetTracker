import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ROUTES } from '@/constants/routes'
import Spinner from '@/components/ui/Spinner'

const LandingPage      = lazy(() => import('@/pages/LandingPage'))
const LoginPage        = lazy(() => import('@/pages/LoginPage'))
const SignupPage       = lazy(() => import('@/pages/SignupPage'))
const DashboardPage    = lazy(() => import('@/pages/DashboardPage'))
const UploadPage       = lazy(() => import('@/pages/UploadPage'))
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'))
const CategoryPage     = lazy(() => import('@/pages/CategoryPage'))
const SettingsPage     = lazy(() => import('@/pages/SettingsPage'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path={ROUTES.HOME}         element={<LandingPage />} />
            <Route path={ROUTES.LOGIN}        element={<LoginPage />} />
            <Route path={ROUTES.SIGNUP}       element={<SignupPage />} />
            <Route path={ROUTES.DASHBOARD}    element={<DashboardPage />} />
            <Route path={ROUTES.UPLOAD}       element={<UploadPage />} />
            <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
            <Route path={ROUTES.CATEGORY}     element={<CategoryPage />} />
            <Route path={ROUTES.SETTINGS}     element={<SettingsPage />} />
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </BrowserRouter>
  )
}
