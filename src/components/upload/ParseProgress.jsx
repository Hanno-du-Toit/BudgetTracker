import { motion, AnimatePresence } from 'framer-motion'
import { FADE_IN } from '@/constants/animation'

const AI_SUBTITLE = 'Claude is reading your transactions and assigning categories'
const FILE_SUBTITLE = 'This happens entirely in your browser — your file is never uploaded'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function RingProgress({ progress, isAiStep }) {
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      {/* AI breathing glow */}
      <AnimatePresence>
        {isAiStep && (
          <motion.div
            key="ai-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.08, 1] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: '0 0 40px rgba(232,121,249,0.45)' }}
          />
        )}
      </AnimatePresence>

      <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="pg-file" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c5cfc" />
            <stop offset="100%" stopColor="#9d82fd" />
          </linearGradient>
          <linearGradient id="pg-ai" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c5cfc" />
            <stop offset="50%" stopColor="#9d82fd" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <filter id="pg-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track ring */}
        <circle
          cx="72" cy="72" r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="6"
        />

        {/* Progress arc */}
        <motion.circle
          cx="72" cy="72" r={RADIUS}
          fill="none"
          stroke={isAiStep ? 'url(#pg-ai)' : 'url(#pg-file)'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          filter="url(#pg-glow)"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isAiStep ? (
            <motion.span
              key="ai-icon"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: [1, 1.18, 1] }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ scale: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }, opacity: { duration: 0.2 } }}
              className="text-3xl select-none"
              style={{ display: 'inline-block' }}
            >
              ✨
            </motion.span>
          ) : (
            <motion.span
              key="pct"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold text-white tabular-nums"
            >
              {Math.round(progress)}%
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function ParseProgress({ progress, parseStep, isAiStep }) {
  return (
    <motion.div {...FADE_IN} className="w-full">
      <div className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 flex flex-col items-center gap-6">

        {/* Ring */}
        <RingProgress progress={progress} isAiStep={isAiStep} />

        {/* Step label */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <div className="min-h-[1.75rem] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={parseStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="text-white font-semibold text-base"
              >
                {parseStep || 'Processing…'}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">
            {isAiStep ? AI_SUBTITLE : FILE_SUBTITLE}
          </p>
        </div>

        {/* Progress bar + dots */}
        <div className="w-full flex flex-col gap-3">
          <div className="bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isAiStep
                  ? 'linear-gradient(90deg, #7c5cfc, #9d82fd, #e879f9)'
                  : 'linear-gradient(90deg, #7c5cfc, #9d82fd)',
                boxShadow: isAiStep
                  ? '0 0 10px rgba(232,121,249,0.5)'
                  : '0 0 10px rgba(139,92,246,0.5)',
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            {['Parse', 'Detect', 'Extract', 'AI'].map((label, i) => {
              const stepPct = [10, 40, 55, 100][i]
              const active  = progress >= stepPct
              return (
                <div key={label} className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      backgroundColor: active ? '#7c5cfc' : 'rgba(255,255,255,0.1)',
                      boxShadow: active ? '0 0 6px rgba(124,92,252,0.7)' : 'none',
                    }}
                    transition={{ duration: 0.4 }}
                    className="w-1.5 h-1.5 rounded-full"
                  />
                  {i < 3 && <div className="w-5 h-px bg-white/10" />}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </motion.div>
  )
}
