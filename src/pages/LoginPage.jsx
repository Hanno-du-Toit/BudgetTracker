import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/context/ToastContext'
import { ROUTES } from '@/constants/routes'
import { SLIDE_UP } from '@/constants/animation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { AuthCard, AuthLogo, AuthField, AuthFooter } from '@/components/auth/AuthCard'

export default function LoginPage() {
  const { signIn, user, loading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [errors,    setErrors]    = useState({})
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.redirect ?? ROUTES.DASHBOARD

  // Already logged in — go straight to dashboard
  if (!loading && user) return <Navigate to={redirectTo} replace />

  function validate() {
    const e = {}
    if (!email)    e.email    = 'Email is required.'
    if (!password) e.password = 'Password is required.'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSubmitting(true)

    const { error } = await signIn(email, password)
    setSubmitting(false)

    if (error) {
      setErrors({ form: error })
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <AuthCard>
      <AuthLogo />

      <motion.div variants={SLIDE_UP} className="card p-8">
        <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
        <p className="text-white/40 text-sm mb-6">Sign in to your account</p>

        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-5"
          >
            {errors.form}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <AuthField>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />
          </AuthField>

          <AuthField>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">Password</label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-xs text-white/40 hover:text-brand-light transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />
            </div>
          </AuthField>

          <AuthField>
            <Button
              type="submit"
              size="lg"
              isLoading={submitting}
              className="w-full mt-2"
            >
              Sign in
            </Button>
          </AuthField>
        </form>
      </motion.div>

      <AuthFooter
        text="Don't have an account?"
        linkText="Create one"
        to={ROUTES.SIGNUP}
      />
    </AuthCard>
  )
}
