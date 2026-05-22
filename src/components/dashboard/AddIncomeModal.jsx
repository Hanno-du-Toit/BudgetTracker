import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/context/ToastContext'

export default function AddIncomeModal({ isOpen, onClose, currentAmount, currentLabel, saveMonthlyIncome }) {
  const { toast }             = useToast()
  const [amount, setAmount]   = useState('')
  const [label,  setLabel]    = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const amountRef             = useRef(null)

  // Sync form values whenever the modal opens or when the saved values change while it's open
  useEffect(() => {
    if (!isOpen) return
    setAmount(currentAmount != null ? String(currentAmount) : '')
    setLabel(currentLabel ?? '')
  }, [isOpen, currentAmount, currentLabel])

  // Focus the amount input only when the modal first opens
  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => amountRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  async function handleClear() {
    setIsSaving(true)
    try {
      await saveMonthlyIncome(null, null)
      toast.success('Monthly income removed.')
      onClose()
    } catch (err) {
      console.error('[AddIncomeModal] clear failed:', err)
      toast.error('Failed to remove. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSave() {
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) {
      toast.error('Amount must be a positive number.')
      return
    }
    setIsSaving(true)
    try {
      await saveMonthlyIncome(parsed, label.trim())
      toast.success('Monthly income saved.')
      onClose()
    } catch (err) {
      console.error('[AddIncomeModal]', err)
      toast.error('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className="relative z-10 w-full max-w-sm bg-[#0f0a28]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <div className="mb-5">
              <h2 className="text-lg font-semibold tracking-tight">Monthly Income</h2>
              <p className="text-sm text-white/40 mt-0.5 leading-relaxed">
                Set your expected monthly income — shown every month until you change it
              </p>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-2">
                Amount in Rands
              </label>
              <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand/50 transition-colors duration-150">
                <span className="text-white/40 font-bold text-xl shrink-0 leading-none">R</span>
                <input
                  ref={amountRef}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-2xl font-bold text-white placeholder-white/20 outline-none min-w-0
                             [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Clear existing setting */}
            {currentAmount != null && (
              <div className="mb-3 -mt-1">
                <button
                  onClick={handleClear}
                  disabled={isSaving}
                  className="text-xs text-red-400/70 hover:text-red-400 underline underline-offset-2 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                >
                  Remove monthly income
                </button>
              </div>
            )}

            {/* Label */}
            <div className="mb-6">
              <label className="block text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-2">
                Label (e.g. Dad's allowance, Bursary)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Monthly salary"
                maxLength={60}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white
                           placeholder-white/20 outline-none focus:border-brand/50 transition-colors duration-150"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-white/70 hover:text-white
                           text-sm px-4 py-2.5 rounded-xl transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !amount}
                className="flex-1 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 rounded-xl
                           transition-all duration-150 shadow-[0_0_20px_rgba(124,92,252,0.35)]
                           hover:shadow-[0_0_30px_rgba(124,92,252,0.55)]
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
