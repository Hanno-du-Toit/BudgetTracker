import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ParseProgress({ progress, rateLimitSeconds = 0 }) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)))
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (rateLimitSeconds > 0) setCountdown(rateLimitSeconds)
  }, [rateLimitSeconds])

  useEffect(() => {
    if (countdown <= 0) return
    const id = setTimeout(() => setCountdown(prev => Math.max(0, prev - 1)), 1000)
    return () => clearTimeout(id)
  }, [countdown])

  return (
    <div className="w-full flex flex-col items-center gap-6 py-10">
      <AnimatePresence mode="wait">
        {countdown > 0 ? (
          <motion.div
            key="rate-limit"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="text-2xl">⏳</span>
            <p className="text-sm text-white/50">
              Rate limit reached — resuming in {countdown}s...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full flex flex-col items-center gap-6"
          >
            <span className="text-4xl font-bold text-white tracking-tight tabular-nums">
              {clamped}%
            </span>
            <div className="h-2 bg-white/10 rounded-full w-full max-w-md mx-auto overflow-hidden">
              <motion.div
                className="bg-white rounded-full h-full"
                initial={{ width: '0%' }}
                animate={{ width: `${clamped}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
