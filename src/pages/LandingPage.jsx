import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES, STAGGER_CONTAINER, SLIDE_UP, FADE_IN, DURATION, EASING } from '@/constants'
import PageWrapper from '@/components/layout/PageWrapper'
import Button from '@/components/ui/Button'

const FEATURES = [
  {
    icon: '🔒',
    title: 'Private by design',
    body: 'Bank statements are parsed entirely in your browser. No file ever reaches a server or third-party service.',
  },
  {
    icon: '🤖',
    title: 'AI categorisation',
    body: 'Claude automatically categorises every transaction so you can see exactly where your money goes.',
  },
  {
    icon: '📊',
    title: 'Instant insights',
    body: 'Interactive charts, spending breakdowns, and monthly trends — ready the moment you upload.',
  },
]

const STATS = [
  { value: '100%', label: 'Client-side parsing' },
  { value: 'Zero', label: 'Data sent to servers' },
  { value: 'Free', label: 'To get started' },
]

export default function LandingPage() {
  return (
    <PageWrapper className="min-h-screen flex flex-col bg-surface overflow-x-hidden">

      {/* Background glow — decorative radial gradient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(124,92,252,0.20) 0%, transparent 65%)',
        }}
      />

      {/* Top nav */}
      <nav className="relative z-10 w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <span className="font-bold text-white tracking-tight">BudgetTracker</span>
        </div>
        <Link
          to={ROUTES.LOGIN}
          className="text-sm text-white/50 hover:text-white transition-colors duration-150"
        >
          Sign in →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-8 pb-20">
        <motion.div
          variants={STAGGER_CONTAINER}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center gap-6 max-w-2xl w-full"
        >
          {/* Privacy badge */}
          <motion.div variants={SLIDE_UP}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/25 text-brand-light text-xs font-medium">
              <span>🔒</span>
              Your files never leave your device
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={SLIDE_UP}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight"
          >
            <span className="bg-gradient-to-b from-white to-white/65 bg-clip-text text-transparent">
              Track every rand.
            </span>
            <br />
            <span className="bg-gradient-to-r from-brand-light via-brand to-brand-dark bg-clip-text text-transparent">
              Understand every spend.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={SLIDE_UP}
            className="text-white/50 text-lg leading-relaxed max-w-md"
          >
            AI-powered budget insights with zero cloud exposure. Upload your bank statement and see exactly where your money goes — instantly.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={SLIDE_UP} className="flex flex-col sm:flex-row gap-3 mt-1">
            <Link to={ROUTES.SIGNUP}>
              <Button size="lg" className="w-full sm:w-auto">
                Get started — it's free
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            variants={SLIDE_UP}
            className="flex items-center gap-6 sm:gap-10 mt-4 pt-6 border-t border-white/5 w-full justify-center"
          >
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-bold text-white">{s.value}</span>
                <span className="text-xs text-white/35">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={STAGGER_CONTAINER}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mt-16"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={SLIDE_UP}
              className="card text-left flex flex-col gap-3 hover:border-white/10 transition-colors duration-200"
            >
              <span className="text-2xl">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-white text-sm">{f.title}</h3>
                <p className="text-white/40 text-xs mt-1.5 leading-relaxed">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-white/20 py-6 px-4 border-t border-white/5">
        BudgetTracker · Built with care · Your data stays yours
      </footer>
    </PageWrapper>
  )
}
