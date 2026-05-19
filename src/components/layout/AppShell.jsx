import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { SLIDE_IN_RIGHT } from '@/constants/animation'

const NAV_LINKS = [
  { to: ROUTES.DASHBOARD,    label: 'Dashboard',     icon: '📊' },
  { to: ROUTES.UPLOAD,       label: 'Upload',        icon: '⬆️' },
  { to: ROUTES.TRANSACTIONS, label: 'Transactions',  icon: '📋' },
  { to: ROUTES.SETTINGS,     label: 'Settings',      icon: '⚙️' },
]

function AvatarInitial({ profile, user }) {
  const name = profile?.display_name ?? user?.email ?? '?'
  const initial = name.charAt(0).toUpperCase()
  const color = profile?.avatar_color ?? '#7c5cfc'
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  )
}

export default function AppShell({ children }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate(ROUTES.LOGIN)
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-brand/15 text-brand-light'
        : 'text-white/50 hover:text-white hover:bg-white/5'
    }`

  return (
    <div className="min-h-screen flex flex-col">
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
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                <span>{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: avatar + sign out */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSignOut}
              className="hidden md:block text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Sign out
            </button>
            <AvatarInitial profile={profile} user={user} />

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white/60 hover:text-white p-1"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={SLIDE_IN_RIGHT.initial}
              animate={SLIDE_IN_RIGHT.animate}
              exit={SLIDE_IN_RIGHT.exit}
              transition={SLIDE_IN_RIGHT.transition}
              className="fixed top-0 right-0 bottom-0 z-50 w-64 bg-surface-50 border-l border-white/5 flex flex-col p-5"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <AvatarInitial profile={profile} user={user} />
                  <span className="text-sm text-white/60 truncate max-w-[140px]">
                    {profile?.display_name ?? user?.email}
                  </span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white">
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-1 flex-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={navLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <button
                onClick={handleSignOut}
                className="text-sm text-white/40 hover:text-white/70 transition-colors text-left mt-4"
              >
                Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
