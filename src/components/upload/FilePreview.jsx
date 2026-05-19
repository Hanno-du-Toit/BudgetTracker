import { motion } from 'framer-motion'
import { SLIDE_UP } from '@/constants/animation'
import { formatFileSize } from '@/utils/formatters'

export default function FilePreview({ file, onRemove }) {
  return (
    <motion.div
      {...SLIDE_UP}
      className="flex items-center gap-3 bg-surface-50 border border-white/5 rounded-2xl px-4 py-3 w-full"
    >
      <span className="text-2xl shrink-0">📊</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{file.name}</p>
        <p className="text-xs text-white/30">{formatFileSize(file.size)}</p>
      </div>

      <button
        onClick={onRemove}
        className="text-white/30 hover:text-red-400 transition-colors text-lg shrink-0"
        aria-label="Remove file"
      >
        ✕
      </button>
    </motion.div>
  )
}
