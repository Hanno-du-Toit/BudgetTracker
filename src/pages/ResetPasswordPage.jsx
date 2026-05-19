import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { SLIDE_UP, FADE_IN } from '@/constants/animation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { AuthCard, AuthLogo, AuthField } from '@/components/auth/AuthCard'

export default function ResetPasswordPage() {
  const { user, loading, updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [errors,    setErrors]    = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done,      setDone]      = useState(false)

  // If user lands here without a recovery session, redirect to forgot-password
  if (!loading && !user) {
    return <Navigate to={ROUTES.FORGOT_PASSWORD} replace />
  }

  function validate() {
    const e = {}
    if (!password)           e.password = 'Password is required.'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (password !== confirm) e.confirm  = 'Passwords do not match.'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSubmitting(true)

    const { error } = await updatePassword(password)
    setSubmitting(false)

    if (error) { setErrors({ form: error }); return }
    setDone(true)
  }

  if (done) {
    return (
      <AuthCard>
        <AuthLogo />
        <motion.div {...FADE_IN} className="card p-8 text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-semibold mb-2">Password updated</h2>
          <p className="text-white/50 text-sm mb-6">
            Your password has been changed successfully.
          </p>
          <Button className="w-full" onClick={() => navigate(ROUTES.DASHBOARD)}>
            Go to dashboard
          </Button>
        </motion.div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthLogo />

      <motion.div variants={SLIDE_UP} className="card p-8">
        <h2 className="text-xl font-semibold mb-1">Set a new password</h2>
        <p className="text-white/40 text-sm mb-6">Choose a strong password for your account.</p>

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
              label="New password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
              autoFocus
            />
          </AuthField>

          <AuthField>
            <Input
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
              autoComplete="new-password"
            />
          </AuthField>

          <AuthField>
            <Button type="submit" size="lg" isLoading={submitting} className="w-full mt-2">
              Update password
            </Button>
          </AuthField>
        </form>
      </motion.div>
    </AuthCard>
  )
}
