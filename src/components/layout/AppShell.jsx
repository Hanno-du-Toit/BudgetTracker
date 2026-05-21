import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Upload, Receipt, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { BackgroundGradientAnimation } from '@/components/ui/BackgroundGradientAnimation'
import FloatingActionMenu from '@/components/ui/FloatingActionMenu'

// ── Animation variants ────────────────────────────────────────────────────────

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
    },
  },
}

const sharedTransition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const navItems = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    gradient: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(109,40,217,0.06) 50%, rgba(76,29,149,0) 100%)',
    iconColor: 'group-hover:text-purple-400',
  },
  {
    icon: <Upload className="h-5 w-5" />,
    label: 'Upload',
    href: ROUTES.UPLOAD,
    gradient: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(109,40,217,0.06) 50%, rgba(76,29,149,0) 100%)',
    iconColor: 'group-hover:text-purple-400',
  },
  {
    icon: <Receipt className="h-5 w-5" />,
    label: 'Transactions',
    href: ROUTES.TRANSACTIONS,
    gradient: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(109,40,217,0.06) 50%, rgba(76,29,149,0) 100%)',
    iconColor: 'group-hover:text-purple-400',
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
    href: ROUTES.SETTINGS,
    gradient: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(109,40,217,0.06) 50%, rgba(76,29,149,0) 100%)',
    iconColor: 'group-hover:text-purple-400',
  },
]

// ── Wordmark ──────────────────────────────────────────────────────────────────

function Wordmark() {
  return (
    <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5 shrink-0 select-none">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.6"/>
        <path d="M8 14l3-3 2 2 3-4" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="17" cy="9" r="1.5" fill="#8b5cf6"/>
      </svg>
      <span className="text-lg tracking-tight">
        <span className="font-light text-white/70">Budget</span>
        <span className="font-bold text-white">Tracker</span>
      </span>
    </Link>
  )
}

// ── Avatar initial ────────────────────────────────────────────────────────────

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

// ── Desktop nav item (3D flip on hover) ───────────────────────────────────────

function DesktopNavItem({ item, isActive }) {
  return (
    <Link
      to={item.href}
      className="outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded-xl"
    >
      <motion.div
        whileHover="hover"
        initial="initial"
        className={`relative flex items-center px-4 py-2 rounded-xl cursor-pointer ${
          isActive ? 'bg-purple-500/15' : ''
        }`}
        style={{ perspective: '600px' }}
      >
        {/* Radial glow blooms on hover */}
        <motion.div
          variants={glowVariants}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: item.gradient, filter: 'blur(8px)' }}
        />

        {/* Front face — visible at rest */}
        <motion.div
          variants={itemVariants}
          transition={sharedTransition}
          className="flex items-center gap-2 relative z-10"
        >
          <span className={isActive ? 'text-purple-300' : 'text-white/45'}>
            {item.icon}
          </span>
          <span className={`text-sm font-medium ${isActive ? 'text-purple-300' : 'text-white/55'}`}>
            {item.label}
          </span>
        </motion.div>

        {/* Back face — flies in from below on hover */}
        <motion.div
          variants={backVariants}
          transition={sharedTransition}
          className="absolute inset-0 flex items-center gap-2 px-4 z-10"
        >
          <span className="text-purple-400">{item.icon}</span>
          <span className="text-sm font-medium text-purple-300">{item.label}</span>
        </motion.div>
      </motion.div>
    </Link>
  )
}

// ── Desktop floating pill navbar ──────────────────────────────────────────────

function DesktopNav({ user, profile, onSignOut }) {
  const location = useLocation()

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Left: wordmark */}
      <Wordmark />

      <div className="w-px h-5 bg-white/10 mx-2 shrink-0" />

      {/* Center: nav items */}
      {navItems.map((item) => (
        <DesktopNavItem
          key={item.href}
          item={item}
          isActive={location.pathname === item.href}
        />
      ))}

      <div className="w-px h-5 bg-white/10 mx-2 shrink-0" />

      {/* Right: avatar + sign out */}
      <div className="flex items-center gap-3">
        <Link to={ROUTES.SETTINGS}>
          <AvatarInitial profile={profile} user={user} />
        </Link>
        <button
          onClick={onSignOut}
          className="text-xs text-white/40 hover:text-white/70 transition-colors duration-150 focus-visible:outline-none"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}

// ── Mobile bottom nav ─────────────────────────────────────────────────────────

function MobileNav() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-black/60 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors duration-150 ${
                isActive ? 'text-purple-400' : 'text-white/35'
              }`}
            >
              {/* Purple dot indicator above icon */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-dot"
                    className="absolute top-2 w-1 h-1 bg-purple-400 rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              <motion.span
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {item.icon}
              </motion.span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
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
      <div className="opacity-20 pointer-events-none">
        <BackgroundGradientAnimation
          interactive={false}
          size="25%"
          gradientBackgroundStart="rgb(8, 5, 20)"
          gradientBackgroundEnd="rgb(5, 3, 15)"
          containerClassName="z-0"
        />
      </div>

      {/* Desktop floating navbar */}
      <DesktopNav user={user} profile={profile} onSignOut={handleSignOut} />

      {/* Page content — pt-20 clears desktop top nav, pb-24 clears mobile bottom nav */}
      <main className="relative flex-1 pb-24 md:pt-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Floating action menu — desktop only */}
      <FloatingActionMenu />
    </div>
  )
}
