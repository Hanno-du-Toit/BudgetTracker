import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const GLOW_COLORS = {
  purple: 'rgba(139, 92, 246, 0.18)',
  blue:   'rgba(59, 130, 246, 0.15)',
  white:  'rgba(255, 255, 255, 0.08)',
}

export function SpotlightCard({ children, className, glowColor = 'purple', customSize = false }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  function onMouseMove(e) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const color = GLOW_COLORS[glowColor] ?? GLOW_COLORS.purple
  const radius = customSize ? '300px' : '180px'

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={cn('relative overflow-hidden', className)}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: visible ? 1 : 0,
          background: `radial-gradient(${radius} circle at ${pos.x}px ${pos.y}px, ${color}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  )
}
