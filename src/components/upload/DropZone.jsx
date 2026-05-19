import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ACCEPTED_FILE_EXTENSIONS, MAX_FILE_SIZE_MB } from '@/constants/limits'

const BANKS = ['FNB', 'ABSA', 'Nedbank', 'Standard Bank', 'Capitec']

export default function DropZone({ onFileAccepted, disabled = false }) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationError, setValidationError] = useState('')

  function validateFile(file) {
    const name = file.name.toLowerCase()
    const isValid = ACCEPTED_FILE_EXTENSIONS.some((ext) => name.endsWith(ext))
    if (!isValid) return `Only CSV and PDF files are supported. You uploaded a ${name.split('.').pop().toUpperCase()} file.`
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File is too large (max ${MAX_FILE_SIZE_MB} MB). Export a shorter date range.`
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
                   cursor-pointer select-none transition-opacity"
        style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
      >
        <motion.div
          animate={{ y: isDragOver ? -4 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-5xl"
        >
          {isDragOver ? '📂' : '📄'}
        </motion.div>

        <div className="text-center">
          <p className="text-white font-medium">
            {isDragOver ? 'Drop it!' : 'Drop your bank statement here'}
          </p>
          <p className="text-white/40 text-sm mt-1">
            or{' '}
            <span className="text-brand-light underline underline-offset-2">
              click to browse
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/30">
          <span className="px-2 py-0.5 bg-white/5 rounded-md">CSV</span>
          <span className="px-2 py-0.5 bg-white/5 rounded-md">PDF</span>
          <span>· max {MAX_FILE_SIZE_MB} MB</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.pdf"
          className="hidden"
          onChange={onInputChange}
        />
      </motion.div>

      {validationError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 text-center"
        >
          ⚠ {validationError}
        </motion.p>
      )}

      <p className="text-xs text-white/25 text-center">
        Supported banks: {BANKS.join(' · ')}
      </p>

      <p className="text-xs text-white/20 text-center">
        🔒 Files are read in your browser — never uploaded to any server
      </p>
    </div>
  )
}
