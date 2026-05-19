import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { SLIDE_UP, FADE_IN } from '@/constants/animation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { AuthCard, AuthLogo, AuthField, AuthFooter } from '@/components/auth/AuthCard'

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth()

  const [email,     setEmail]     = useState('')
  const [error,     setError]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent,      setSent]      = useState(false)

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!email) { setError('Email is required.'); return }
    setError('')
    setSubmitting(true)

    const { error: apiError } = await sendPasswordReset(email)
    setSubmitting(false)

    if (apiError) { setError(apiError); return }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthCard>
        <AuthLogo />
        <motion.div {...FADE_IN} className="card p-8 text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-xl font-semibold mb-2">Reset link sent</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            We emailed a password reset link to{' '}
            <span className="text-white/80">{email}</span>.
            Check your inbox — it may take a minute.
          </p>
          <p className="text-white/30 text-xs mt-3">
            Didn't receive it? Check your spam folder.
          </p>
        </motion.div>
        <AuthFooter text="Remembered it?" linkText="Back to sign in" to={ROUTES.LOGIN} />
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthLogo />

      <motion.div variants={SLIDE_UP} className="card p-8">
        <h2 className="text-xl font-semibold mb-1">Forgot your password?</h2>
        <p className="text-white/40 text-sm mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-5"
          >
            {error}
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
              autoComplete="email"
              autoFocus
            />
          </AuthField>

          <AuthField>
            <Button type="submit" size="lg" isLoading={submitting} className="w-full mt-2">
              Send reset link
            </Button>
          </AuthField>
        </form>
      </motion.div>

      <AuthFooter text="Remembered it?" linkText="Back to sign in" to={ROUTES.LOGIN} />
    </AuthCard>
  )
}
