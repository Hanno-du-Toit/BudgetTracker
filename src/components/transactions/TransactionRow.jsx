import { formatCurrency, formatDate } from '@/utils/formatters'
import CategoryBadge from './CategoryBadge'

function AmountCell({ amount }) {
  const isIncome = amount > 0
  return (
    <span className={`font-medium tabular-nums text-sm ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
      {isIncome ? '+' : '−'}{formatCurrency(amount)}
    </span>
  )
}

export default function TransactionRow({ txn, onEditCategory, onDelete }) {
  return (
    <div className="grid grid-cols-[72px_1fr_auto_auto] sm:grid-cols-[80px_1fr_130px_110px_36px] gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors group">
      {/* Date */}
      <span className="text-xs text-white/40 tabular-nums">
        {formatDate(txn.transaction_date)}
      </span>

      {/* Description */}
      <span className="text-sm text-white truncate" title={txn.description}>
        {txn.description}
      </span>

      {/* Category — hidden on smallest screens */}
      <span className="hidden sm:flex items-center">
        <CategoryBadge category={txn.category} onClick={() => onEditCategory(txn)} />
      </span>

      {/* Amount */}
      <span className="flex justify-end">
        <AmountCell amount={txn.amount} />
      </span>

      {/* Delete */}
      <span className="hidden sm:flex justify-end">
        <button
          onClick={() => onDelete(txn)}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all"
          aria-label={`Delete ${txn.description}`}
        >
          ✕
        </button>
      </span>
    </div>
  )
}
