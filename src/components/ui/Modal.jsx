import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

const BACKDROP = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1 },
  exit:     { opacity: 0 },
  transition: { duration: 0.15 },
}

const PANEL = {
  initial:  { opacity: 0, scale: 0.96, y: 8 },
  animate:  { opacity: 1, scale: 1,    y: 0 },
  exit:     { opacity: 0, scale: 0.96, y: 8 },
  transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  const panelRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Move focus into panel when it opens
  useEffect(() => {
    if (isOpen) panelRef.current?.focus()
  }, [isOpen])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            {...BACKDROP}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            {...PANEL}
            ref={panelRef}
            tabIndex={-1}
            className={`relative z-10 w-full ${maxWidth} bg-surface-50 border border-white/8 rounded-2xl shadow-2xl outline-none`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
              <h2 className="text-base font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white transition-colors text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
