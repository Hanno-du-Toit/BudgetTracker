import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { TOAST_DURATION_MS } from '@/constants/limits'

const STYLES = {
  success: 'bg-green-500/10 border-green-500/30 text-green-300',
  error:   'bg-red-500/10 border-red-500/30 text-red-300',
  info:    'bg-brand/10 border-brand/30 text-brand-light',
}

const ICONS = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
}

export default function Toast({ id, message, type, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm
        shadow-xl text-sm font-medium max-w-sm w-full cursor-pointer
        ${STYLES[type]}
      `}
      onClick={() => onDismiss(id)}
    >
      <span className="text-base leading-none mt-px">{ICONS[type]}</span>
      <span className="flex-1 leading-snug">{message}</span>
    </motion.div>
  )
}
