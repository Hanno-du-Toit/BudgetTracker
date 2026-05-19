import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { STAGGER_CONTAINER, SLIDE_UP } from '@/constants/animation'

export function AuthLogo() {
  return (
    <div className="text-center mb-8">
      <div className="text-4xl mb-3">💰</div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">
        BudgetTracker
      </h1>
    </div>
  )
}

export function AuthCard({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        variants={STAGGER_CONTAINER}
        initial="initial"
        animate="animate"
      >
        {children}
      </motion.div>
    </div>
  )
}

export function AuthField({ children }) {
  return (
    <motion.div variants={SLIDE_UP}>
      {children}
    </motion.div>
  )
}

export function AuthFooter({ text, linkText, to }) {
  return (
    <motion.p variants={SLIDE_UP} className="text-center text-sm text-white/40 mt-6">
      {text}{' '}
      <Link to={to} className="text-brand-light hover:text-white transition-colors font-medium">
        {linkText}
      </Link>
    </motion.p>
  )
}
