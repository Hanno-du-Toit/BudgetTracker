import { motion, AnimatePresence } from 'framer-motion'
import { FADE_IN } from '@/constants/animation'

const FILE_STEPS  = ['Reading your file…', 'Detecting bank format…', 'Extracting transactions…', 'Preparing AI categorization…']
const AI_SUBTITLE = 'Claude is reading your transactions and assigning categories'
const FILE_SUBTITLE = 'This happens entirely in your browser — your file is never uploaded'

export default function ParseProgress({ progress, parseStep, isAiStep }) {
  return (
    <motion.div {...FADE_IN} className="flex flex-col items-center gap-6 w-full py-10">
      {/* Animated icon — switches between gears and sparkles */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isAiStep ? (
            <motion.div
              key="ai"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-5xl"
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                style={{ display: 'inline-block' }}
              >
                ✨
              </motion.span>
            </motion.div>
          ) : (
            <motion.div
              key="parse"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-5xl"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 15, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                style={{ display: 'inline-block' }}
              >
                ⚙️
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step label */}
      <div className="text-center min-h-[3rem] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={parseStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-white font-medium"
          >
            {parseStep || 'Processing…'}
          </motion.p>
        </AnimatePresence>
        <p className="text-white/40 text-sm mt-1.5 max-w-xs text-center">
          {isAiStep ? AI_SUBTITLE : FILE_SUBTITLE}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        <div className="bg-white/[0.06] rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isAiStep
                ? 'linear-gradient(90deg, #7c5cfc, #9d82fd, #e879f9)'
                : 'linear-gradient(90deg, #7c5cfc, #9d82fd)',
              boxShadow: isAiStep
                ? '0 0 12px rgba(232, 121, 249, 0.5)'
                : '0 0 12px rgba(124, 92, 252, 0.45)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-white/25 text-center">{Math.round(progress)}%</p>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-2">
        {['Parse', 'Detect', 'Extract', 'AI'].map((label, i) => {
          const stepPct = [10, 40, 55, 100][i]
          const active  = progress >= stepPct
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                active ? 'bg-brand' : 'bg-white/10'
              }`} />
              {i < 3 && <div className="w-6 h-px bg-white/10" />}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
