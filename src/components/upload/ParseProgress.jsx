import { useEffect } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

export default function ParseProgress({ progress }) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)))
  const width   = useMotionValue(0)

  useEffect(() => {
    const controls = animate(width, clamped, {
      duration: 0.6,
      ease: 'easeOut',
    })
    return () => controls.stop()
  }, [clamped, width])

  return (
    <div className="w-full flex flex-col items-center gap-6 py-10">
      <span className="text-4xl font-bold text-white tracking-tight tabular-nums">
        {clamped}%
      </span>
      <div className="h-2 bg-white/10 rounded-full w-full max-w-md mx-auto overflow-hidden">
        <motion.div
          className="bg-white rounded-full h-full"
          style={{ width: width.to((v) => `${v}%`) }}
        />
      </div>
    </div>
  )
}
