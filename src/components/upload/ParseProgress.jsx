import { motion, AnimatePresence } from 'framer-motion'

const AI_SUBTITLE = 'Claude is reading your transactions and assigning categories'
const FILE_SUBTITLE = 'This happens entirely in your browser — your file is never uploaded'

export default function ParseProgress({ progress, parseStep, isAiStep }) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="w-full"
    >
      <div className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-10 flex flex-col items-center gap-5">

        {/* Step title */}
        <div className="min-h-[2rem] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={parseStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="text-xl font-semibold tracking-tight text-white text-center"
            >
              {parseStep || 'Processing…'}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-white/40 text-center max-w-xs leading-relaxed -mt-1">
          {isAiStep ? AI_SUBTITLE : FILE_SUBTITLE}
        </p>

        {/* Progress bar */}
        <div className="w-full flex flex-col gap-2">
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

          {/* Percentage */}
          <p className="text-sm text-white/30 text-center tabular-nums">
            {clampedProgress}%
          </p>
        </div>

      </div>
    </motion.div>
  )
}
