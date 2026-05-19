import { motion } from 'framer-motion'
import Spinner from './Spinner'

const VARIANTS = {
  primary:   'bg-brand hover:bg-brand-dark text-white shadow-glow hover:shadow-none',
  secondary: 'bg-surface-100 hover:bg-surface-200 text-white border border-white/10',
  ghost:     'bg-transparent hover:bg-surface-100 text-white/70 hover:text-white',
  danger:    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export default function Button({
  variant  = 'primary',
  size     = 'md',
  isLoading = false,
  disabled  = false,
  className = '',
  children,
  ...props
}) {
  const isDisabled = disabled || isLoading

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      whileHover={isDisabled ? {} : { opacity: 0.92 }}
      transition={{ duration: 0.1 }}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center gap-2
        font-medium transition-all duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </motion.button>
  )
}
