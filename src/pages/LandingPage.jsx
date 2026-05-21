import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Sparkles, BarChart3, Lock } from 'lucide-react'
import { ROUTES, STAGGER_CONTAINER, SLIDE_UP } from '@/constants'
import PageWrapper from '@/components/layout/PageWrapper'
import Button from '@/components/ui/Button'
import { BackgroundGradientAnimation } from '@/components/ui/BackgroundGradientAnimation'
import { ShimmerText } from '@/components/ui/ShimmerText'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

const FEATURES = [
  {
    Icon: Shield,
    title: 'Private by design',
    body: 'Bank statements are parsed entirely in your browser. No file ever reaches a server or third-party service.',
  },
  {
    Icon: Sparkles,
    title: 'AI categorisation',
    body: 'Claude automatically categorises every transaction so you can see exactly where your money goes.',
  },
  {
    Icon: BarChart3,
    title: 'Instant insights',
    body: 'Interactive charts, spending breakdowns, and monthly trends — ready the moment you upload.',
  },
]

const STATS = [
  { value: '100%', label: 'Client-side parsing' },
  { value: 'Zero', label: 'Data sent to servers' },
  { value: 'Free', label: 'To get started' },
]

// Bar heights for the animated bar chart in the hero illustration
const BAR_HEIGHTS = [30, 45, 25, 55, 40, 50, 42]

// ── Hero illustration ─────────────────────────────────────────────────────────

function HeroIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
      className="relative select-none w-full max-w-sm"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 380 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <defs>
            <radialGradient id="hglow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
            <filter id="hblur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="24" />
            </filter>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Ambient glow blob */}
          <ellipse cx="200" cy="210" rx="170" ry="150" fill="url(#hglow)" filter="url(#hblur)" />

          {/* ── Card 1: Balance + animated bar chart ── */}
          <rect x="10" y="20" width="235" height="158" rx="16"
            fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
          <text x="30" y="50" fill="rgba(255,255,255,0.35)" fontSize="10"
            fontFamily="Inter, system-ui">Monthly Spend</text>
          <text x="30" y="77" fill="white" fontSize="23" fontWeight="700"
            fontFamily="Inter, system-ui">R 24,850</text>
          <text x="178" y="77" fill="#4ade80" fontSize="11" fontWeight="600"
            fontFamily="system-ui">↑ 8.2%</text>

          {/* Animated bars */}
          {BAR_HEIGHTS.map((h, i) => (
            <motion.rect
              key={i}
              x={30 + i * 29}
              width="16"
              rx="4"
              fill="url(#barGrad)"
              initial={{ height: 0, y: 165 }}
              animate={{ height: h, y: 165 - h }}
              transition={{ duration: 0.55, delay: 0.6 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}

          {/* ── Card 2: Spending donut ── */}
          <rect x="135" y="196" width="235" height="180" rx="16"
            fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
          <text x="156" y="224" fill="rgba(255,255,255,0.35)" fontSize="10"
            fontFamily="Inter, system-ui">Spending by category</text>

          {/* Donut track */}
          <circle cx="308" cy="298" r="46" stroke="rgba(255,255,255,0.06)" strokeWidth="20" fill="none" />

          {/* Segment 1 — 33% (groceries), starts at 12 o'clock */}
          <motion.circle cx="308" cy="298" r="46"
            stroke="#8b5cf6" strokeWidth="20" fill="none"
            strokeDasharray="95 289"
            transform="rotate(-90 308 298)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.9 }}
          />
          {/* Segment 2 — 22% (transport), starts at 119° from 12 o'clock = 29° from 3 o'clock */}
          <motion.circle cx="308" cy="298" r="46"
            stroke="#a78bfa" strokeWidth="20" fill="none"
            strokeDasharray="63 289"
            transform="rotate(29 308 298)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 1.1 }}
          />
          {/* Segment 3 — 15% (dining), starts at 198° from 12 o'clock = 108° from 3 o'clock */}
          <motion.circle cx="308" cy="298" r="46"
            stroke="#6d28d9" strokeWidth="20" fill="none"
            strokeDasharray="43 289"
            transform="rotate(108 308 298)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 1.3 }}
          />

          {/* Donut centre label */}
          <text x="308" y="293" fill="rgba(255,255,255,0.5)" fontSize="10"
            textAnchor="middle" fontFamily="Inter, system-ui">Total</text>
          <text x="308" y="309" fill="white" fontSize="14" fontWeight="700"
            textAnchor="middle" fontFamily="Inter, system-ui">R 8.4k</text>

          {/* Legend */}
          <circle cx="158" cy="258" r="4" fill="#8b5cf6" />
          <text x="168" y="262" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui">Groceries  33%</text>
          <circle cx="158" cy="276" r="4" fill="#a78bfa" />
          <text x="168" y="280" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui">Transport  22%</text>
          <circle cx="158" cy="294" r="4" fill="#6d28d9" />
          <text x="168" y="298" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui">Dining       15%</text>

          {/* ── Card 3: AI badge ── */}
          <rect x="10" y="196" width="108" height="86" rx="14"
            fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.22)" strokeWidth="1" />
          <text x="26" y="222" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui">AI categorised</text>
          <text x="26" y="248" fill="#a78bfa" fontSize="22" fontWeight="700"
            fontFamily="Inter, system-ui">98%</text>
          <text x="26" y="265" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="system-ui">of transactions</text>

          {/* ── Card 4: Transaction count ── */}
          <rect x="10" y="300" width="108" height="90" rx="14"
            fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <text x="26" y="326" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui">This month</text>
          <text x="26" y="352" fill="white" fontSize="22" fontWeight="700"
            fontFamily="Inter, system-ui">127</text>
          <text x="26" y="371" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="system-ui">transactions</text>

          {/* Decorative accent dots */}
          <circle cx="365" cy="28" r="2.5" fill="#8b5cf6" opacity="0.55" />
          <circle cx="356" cy="46" r="1.5" fill="#a78bfa" opacity="0.4" />
          <circle cx="12" cy="410" r="4" fill="#6d28d9" opacity="0.3" />
          <circle cx="372" cy="400" r="2.5" fill="#8b5cf6" opacity="0.3" />
        </svg>
      </motion.div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

  return (
    <>
      <BackgroundGradientAnimation
        interactive={!isMobile}
        containerClassName="z-0 pointer-events-none"
      />
      <PageWrapper className="relative z-10 min-h-screen flex flex-col overflow-x-hidden">

        {/* ── Top nav ── */}
        <nav className="relative z-10 w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.6" />
              <path d="M8 14l3-3 2 2 3-4" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="17" cy="9" r="1.5" fill="#8b5cf6" />
            </svg>
            <span className="text-lg tracking-tight">
              <span className="font-light text-white/70">Budget</span>
              <span className="font-bold text-white">Tracker</span>
            </span>
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="text-sm text-white/50 hover:text-white transition-colors duration-150"
          >
            Sign in →
          </Link>
        </nav>

        {/* ── Hero ── */}
        <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-8 pb-20">

          {/* Two-column layout on desktop */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 max-w-5xl w-full">

            {/* Left: text content */}
            <motion.div
              variants={STAGGER_CONTAINER}
              initial="initial"
              animate="animate"
              className="flex flex-col items-center lg:items-start gap-6 text-center lg:text-left w-full lg:max-w-xl"
            >
              {/* Privacy badge */}
              <motion.div variants={SLIDE_UP}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/25 text-brand-light text-xs font-medium">
                  <Lock className="h-3 w-3" />
                  Your files never leave your device
                </span>
              </motion.div>

              {/* Headline with shimmer */}
              <motion.h1
                variants={SLIDE_UP}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight"
              >
                <ShimmerText className="text-white/90">
                  Track every rand.
                </ShimmerText>
                <ShimmerText className="text-brand-light" delay={2}>
                  Understand every spend.
                </ShimmerText>
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
                className="flex items-center gap-6 sm:gap-10 mt-4 pt-6 border-t border-white/5 w-full justify-center lg:justify-start"
              >
                {STATS.map((s) => (
                  <div key={s.label} className="flex flex-col items-center lg:items-start gap-0.5">
                    <span className="text-lg font-bold text-white">{s.value}</span>
                    <span className="text-xs text-white/35">{s.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: SVG illustration (desktop only) */}
            <div className="hidden lg:flex flex-1 justify-end items-center">
              <HeroIllustration />
            </div>
          </div>

          {/* ── Feature cards ── */}
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mt-16"
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={SLIDE_UP}>
                <SpotlightCard
                  glowColor="purple"
                  customSize
                  className="card text-left flex flex-col gap-3 transition-colors duration-200 h-full bg-white/3 backdrop-blur-sm border-white/10 sm:bg-surface-50 sm:backdrop-blur-none sm:border-white/5 hover:border-white/10"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
                    <f.Icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{f.title}</h3>
                    <p className="text-white/40 text-xs mt-1.5 leading-relaxed">{f.body}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Footer ── */}
        <footer className="relative z-10 text-center text-xs text-white/20 py-6 px-4 border-t border-white/5">
          BudgetTracker · Built with care · Your data stays yours
        </footer>
      </PageWrapper>
    </>
  )
}
