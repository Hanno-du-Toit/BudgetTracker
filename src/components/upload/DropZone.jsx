import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileUp, FolderOpen, Lock } from 'lucide-react'
import { MAX_FILE_SIZE_MB } from '@/constants/limits'

const CSV_TIPS = [
  { bank: 'FNB',          tip: 'My Bank Account → Statements → Export CSV' },
  { bank: 'ABSA',         tip: 'Transact → Statement → Download CSV' },
  { bank: 'Capitec',      tip: 'App: Statements → Download · Web: Statements tab' },
  { bank: 'Standard Bank',tip: 'View Transactions → Export → CSV' },
  { bank: 'Nedbank',      tip: 'Accounts → Transaction History → Download CSV' },
  { bank: 'Discovery',    tip: 'My Accounts → Statements → Download CSV' },
]

export default function DropZone({ onFileAccepted, disabled = false }) {
  const inputRef = useRef(null)
  const [isDragOver,      setIsDragOver]      = useState(false)
  const [validationError, setValidationError] = useState('')
  const [showTips,        setShowTips]        = useState(false)

  function validateFile(file) {
    const name = file.name.toLowerCase()
    if (!name.endsWith('.csv')) {
      return `Only CSV files are accepted. You uploaded a .${name.split('.').pop().toUpperCase()} file — please export a CSV from your bank instead.`
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File is too large (max ${MAX_FILE_SIZE_MB} MB). Try exporting a shorter date range.`
    }
    return null
  }

  const handleFile = useCallback((file) => {
    const err = validateFile(file)
    if (err) { setValidationError(err); return }
    setValidationError('')
    onFileAccepted(file)
  }, [onFileAccepted])

  function onDrop(e) {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e) {
    const file = e.target.files[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Drop target */}
      <motion.div
        animate={{
          borderColor: isDragOver ? '#7c5cfc' : 'rgba(255,255,255,0.08)',
          backgroundColor: isDragOver ? 'rgba(124,92,252,0.06)' : 'rgba(255,255,255,0.01)',
          scale: isDragOver ? 1.01 : 1,
        }}
        transition={{ duration: 0.15 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className="w-full border-2 border-dashed rounded-3xl p-10 flex flex-col items-center gap-4
                   cursor-pointer select-none"
        style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
      >
        <motion.div
          animate={{ y: isDragOver ? -4 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center justify-center w-16 h-16 rounded-2xl ${
            isDragOver ? 'bg-brand/20 text-brand-light' : 'bg-white/[0.05] text-white/30'
          } transition-colors duration-150`}
        >
          {isDragOver
            ? <FolderOpen className="h-8 w-8" />
            : <FileUp className="h-8 w-8" />
          }
        </motion.div>

        <div className="text-center">
          <p className="text-white font-medium">
            {isDragOver ? 'Drop it!' : 'Drop your CSV statement here'}
          </p>
          <p className="text-white/40 text-sm mt-1">
            or{' '}
            <span className="text-brand-light underline underline-offset-2">
              click to browse
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/30">
          <span className="px-2 py-0.5 bg-white/5 rounded-md font-medium text-white/50">CSV</span>
          <span>· max {MAX_FILE_SIZE_MB} MB</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onInputChange}
        />
      </motion.div>

      {/* Validation error */}
      <AnimatePresence>
        {validationError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-red-400 text-center"
          >
            ⚠ {validationError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* How to export CSV accordion */}
      <div className="w-full">
        <button
          type="button"
          onClick={() => setShowTips((v) => !v)}
          className="w-full flex items-center justify-between text-xs text-white/40 hover:text-white/60 transition-colors px-1 py-1.5"
        >
          <span>How do I download a CSV from my bank?</span>
          <motion.span
            animate={{ rotate: showTips ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/25 text-sm leading-none ml-2 shrink-0"
          >
            ▾
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showTips && (
            <motion.div
              key="tips"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1.5 pt-1 pb-2">
                {CSV_TIPS.map((t) => (
                  <div key={t.bank} className="flex items-start gap-2.5 px-2 py-1.5 rounded-xl bg-white/[0.03]">
                    <span className="text-brand-light text-xs font-semibold w-24 shrink-0 mt-px">{t.bank}</span>
                    <span className="text-white/40 text-xs leading-relaxed">{t.tip}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-white/20 text-center">
        <Lock className="h-3 w-3 shrink-0" />
        Files are read in your browser — never uploaded to any server
      </p>
    </div>
  )
}
