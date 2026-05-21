import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { STAGGER_CONTAINER, LIST_ITEM } from '@/constants/animation'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'
import CategoryBadge from '@/components/transactions/CategoryBadge'

function AmountCell({ amount }) {
  const isIncome = amount > 0
  return (
    <span className={`text-sm font-medium tabular-nums shrink-0 ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
      {isIncome ? '+' : '−'}{formatCurrency(amount)}
    </span>
  )
}

export default function RecentTransactions({ transactions }) {
  const navigate = useNavigate()
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Recent transactions</h3>
        <button
          onClick={() => navigate(ROUTES.TRANSACTIONS)}
          className="text-xs text-brand-light hover:text-white transition-colors"
        >
          View all →
        </button>
      </div>

      <motion.div
        variants={STAGGER_CONTAINER}
        initial="initial"
        animate="animate"
        className="divide-y divide-white/[0.04]"
      >
        {transactions.map((txn) => (
          <motion.div
            key={txn.id}
            variants={LIST_ITEM}
            className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-white/[0.04] transition-colors -mx-1"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate leading-snug">{txn.description}</p>
              <p className="text-xs text-white/30 mt-0.5">{formatDate(txn.transaction_date)}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <AmountCell amount={txn.amount} />
              <CategoryBadge category={txn.category} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
