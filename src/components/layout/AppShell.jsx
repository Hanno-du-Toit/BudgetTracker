import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { BackgroundGradientAnimation } from '@/components/ui/BackgroundGradientAnimation'

const NAV_LINKS = [
  { to: ROUTES.DASHBOARD,    label: 'Dashboard',    icon: '📊' },
  { to: ROUTES.UPLOAD,       label: 'Upload',       icon: '⬆️' },
  { to: ROUTES.TRANSACTIONS, label: 'Transactions', icon: '📋' },
  { to: ROUTES.SETTINGS,     label: 'Settings',     icon: '⚙️' },
]

function AvatarInitial({ profile, user }) {
  const name    = profile?.display_name ?? user?.email ?? '?'
  const initial = name.charAt(0).toUpperCase()
  const color   = profile?.avatar_color ?? '#7c5cfc'
  return (
    <motion.div
      animate={{ backgroundColor: color }}
      transition={{ duration: 0.3 }}
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 select-none"
    >
      {initial}
    </motion.div>
  )
}

// ── Desktop nav link class ────────────────────────────────────────────────────

const desktopNavClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
    isActive
      ? 'bg-brand/15 text-brand-light'
      : 'text-white/50 hover:text-white hover:bg-white/5'
  }`

// ── Bottom nav (mobile only) ──────────────────────────────────────────────────

function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface/90 backdrop-blur-md border-t border-white/5"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-16">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 text-[10px] font-medium transition-colors duration-150 ${
                isActive ? 'text-brand-light' : 'text-white/40 hover:text-white/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.span
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ duration: 0.15 }}
                  className="text-lg leading-none"
                >
                  {link.icon}
                </motion.span>
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

// ── AppShell ──────────────────────────────────────────────────────────────────

export default function AppShell({ children }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Subtle animated gradient backdrop */}
      <div className="opacity-30 pointer-events-none">
        <BackgroundGradientAnimation
          interactive={false}
          size="40%"
          containerClassName="z-0"
        />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-surface/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <NavLink to={ROUTES.DASHBOARD} className="flex items-center gap-2 shrink-0">
            <span className="text-xl">💰</span>
            <span className="font-bold text-white hidden sm:block">BudgetTracker</span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={desktopNavClass}>
                <span>{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: sign out (desktop) + avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSignOut}
              className="hidden md:block text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Sign out
            </button>
            {/* On mobile the avatar links to Settings; on desktop it's decorative */}
            <NavLink to={ROUTES.SETTINGS} className="md:pointer-events-none">
              <AvatarInitial profile={profile} user={user} />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Page content — pb accounts for the mobile bottom nav */}
      <main className="relative flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
