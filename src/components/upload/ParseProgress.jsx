import { motion, AnimatePresence } from 'framer-motion'

export default function ParseProgress({ progress, parseStep, isAiStep }) {
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const countdown = Math.round(10 - (clampedProgress / 100) * 10)

  return (
    <div className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-10 flex flex-col items-center gap-6 text-center">

      {/* Countdown number or AI sparkle */}
      <div className="h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isAiStep ? (
            <motion.span
              key="sparkle"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className="text-6xl select-none"
              style={{ display: 'inline-block' }}
            >
              ✨
            </motion.span>
          ) : (
            <motion.span
              key={countdown}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="text-6xl font-bold tracking-tight text-white tabular-nums select-none"
              style={{ display: 'inline-block' }}
            >
              {countdown}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Step text */}
      <div className="min-h-[1.25rem] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={parseStep}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-sm text-white/50"
          >
            {parseStep || 'Processing…'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Slider bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: isAiStep
              ? 'linear-gradient(to right, #c084fc, #f472b6)'
              : 'linear-gradient(to right, #a855f7, rgba(255,255,255,0.8))',
            boxShadow: isAiStep
              ? '0 0 8px rgba(192,132,252,0.6)'
              : '0 0 8px rgba(139,92,246,0.6)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

    </div>
  )
}
