import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { SLIDE_UP, FADE_IN } from '@/constants/animation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { AuthCard, AuthLogo, AuthField, AuthFooter } from '@/components/auth/AuthCard'

export default function SignupPage() {
  const { signUp, user, loading } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [errors,      setErrors]      = useState({})
  const [submitting,  setSubmitting]  = useState(false)
  const [confirmed,   setConfirmed]   = useState(false)

  if (!loading && user) return <Navigate to={ROUTES.DASHBOARD} replace />

  function validate() {
    const e = {}
    if (!displayName.trim()) e.displayName = 'Please enter your name.'
    if (!email)              e.email       = 'Email is required.'
    if (!password)           e.password    = 'Password is required.'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (password !== confirm) e.confirm    = 'Passwords do not match.'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSubmitting(true)

    const { error, requiresConfirmation } = await signUp(email, password, displayName.trim())
    setSubmitting(false)

    if (error) { setErrors({ form: error }); return }
    if (requiresConfirmation) { setConfirmed(true); return }

    navigate(ROUTES.DASHBOARD, { replace: true })
  }

  if (confirmed) {
    return (
      <AuthCard>
        <AuthLogo />
        <motion.div {...FADE_IN} className="card p-8 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-semibold mb-2">Check your inbox</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            We sent a confirmation link to <span className="text-white/80">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
          <Button
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Back to sign in
          </Button>
        </motion.div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthLogo />

      <motion.div variants={SLIDE_UP} className="card p-8">
        <h2 className="text-xl font-semibold mb-1">Create your account</h2>
        <p className="text-white/40 text-sm mb-6">Start tracking your spending in minutes</p>

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
              label="Your name"
              type="text"
              placeholder="Jane Smith"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={errors.displayName}
              autoComplete="name"
              autoFocus
            />
          </AuthField>

          <AuthField>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
          </AuthField>

          <AuthField>
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
          </AuthField>

          <AuthField>
            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
              autoComplete="new-password"
            />
          </AuthField>

          <AuthField>
            <Button
              type="submit"
              size="lg"
              isLoading={submitting}
              className="w-full mt-2"
            >
              Create account
            </Button>
          </AuthField>
        </form>
      </motion.div>

      <AuthFooter
        text="Already have an account?"
        linkText="Sign in"
        to={ROUTES.LOGIN}
      />
    </AuthCard>
  )
}
