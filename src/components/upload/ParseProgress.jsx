import { motion, AnimatePresence } from 'framer-motion'

export default function ParseProgress({ progress, parseStep, isAiStep }) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-10 flex flex-col items-center gap-6 text-center">

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

      {/* Progress bar — CSS transition so it stops instantly on unmount */}
      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${clampedProgress}%`,
            transition: 'width 0.8s ease-out',
            background: isAiStep
              ? 'linear-gradient(to right, #c084fc, #f472b6)'
              : 'linear-gradient(to right, #a855f7, rgba(255,255,255,0.8))',
            boxShadow: isAiStep
              ? '0 0 8px rgba(192,132,252,0.6)'
              : '0 0 8px rgba(139,92,246,0.6)',
          }}
        />
      </div>

    </div>
  )
}
