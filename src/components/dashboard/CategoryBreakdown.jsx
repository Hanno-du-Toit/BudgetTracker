import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { STAGGER_CONTAINER, SLIDE_UP } from '@/constants/animation'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/constants/categories'
import { formatCurrency } from '@/utils/formatters'

export default function CategoryBreakdown({ categories }) {
  const navigate = useNavigate()
  return (
    <div className="card">
      <h3 className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-4">Top spending categories</h3>
      <motion.div
        variants={STAGGER_CONTAINER}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-1"
      >
        {categories.map((item) => (
          <motion.button
            key={item.category}
            variants={SLIDE_UP}
            onClick={() => navigate(`/transactions?category=${item.category}`)}
            className="flex items-center gap-3 text-left rounded-xl px-2 py-2 hover:bg-white/[0.06] transition-colors group border-l-2 border-transparent hover:border-brand/30"
          >
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
              style={{ backgroundColor: `${item.fill}20` }}
            >
              {CATEGORY_ICONS[item.category] ?? '📦'}
            </div>

            {/* Label + bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-white group-hover:text-white/90 truncate leading-none">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
                <span
                  className="text-xs font-semibold tabular-nums ml-2 shrink-0"
                  style={{ color: item.fill }}
                >
                  {formatCurrency(item.total)}
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.fill, boxShadow: `0 0 8px ${item.fill}80` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.pct * 100).toFixed(1)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
