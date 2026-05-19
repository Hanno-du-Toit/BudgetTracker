import { motion } from 'framer-motion'
import { FADE_IN, LIST_ITEM, STAGGER_CONTAINER } from '@/constants/animation'
import { formatCurrency, formatDate } from '@/utils/formatters'
import Button from '@/components/ui/Button'

function AmountCell({ amount }) {
  const isCredit = amount > 0
  return (
    <span className={`font-medium tabular-nums ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
      {isCredit ? '+' : '−'} {formatCurrency(amount)}
    </span>
  )
}

function TypeBadge({ amount }) {
  const isCredit = amount > 0
  return (
    <span className={`
      text-[11px] px-2 py-0.5 rounded-full font-medium
      ${isCredit
        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
        : 'bg-red-500/10 text-red-400 border border-red-500/20'}
    `}>
      {isCredit ? 'Credit' : 'Debit'}
    </span>
  )
}

function SummaryStats({ transactions }) {
  const debits  = transactions.filter((t) => t.amount < 0)
  const credits = transactions.filter((t) => t.amount > 0)
  const totalOut = debits.reduce((s, t) => s + Math.abs(t.amount), 0)
  const totalIn  = credits.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {[
        { label: 'Transactions', value: transactions.length, color: 'text-white' },
        { label: 'Total spend',  value: formatCurrency(totalOut), color: 'text-red-400' },
        { label: 'Total income', value: formatCurrency(totalIn),  color: 'text-green-400' },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-surface-100 rounded-xl p-3 text-center">
          <p className={`text-sm font-semibold ${color}`}>{value}</p>
          <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}

export default function TransactionReview({ transactions, fileName, onConfirm, onCancel, isConfirming }) {
  return (
    <motion.div {...FADE_IN} className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Review transactions</h2>
          <p className="text-white/40 text-sm mt-0.5 truncate max-w-xs">{fileName}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-white/30 hover:text-white/60 transition-colors text-sm shrink-0"
        >
          Start over
        </button>
      </div>

      <SummaryStats transactions={transactions} />

      {/* Table */}
      <div className="bg-surface-50 border border-white/5 rounded-2xl overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[90px_1fr_120px_70px] gap-2 px-4 py-2.5 border-b border-white/5 text-[11px] text-white/30 uppercase tracking-wide">
          <span>Date</span>
          <span>Description</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Type</span>
        </div>

        {/* Rows */}
        <motion.div
          variants={STAGGER_CONTAINER}
          initial="initial"
          animate="animate"
          className="divide-y divide-white/[0.04] max-h-[420px] overflow-y-auto"
        >
          {transactions.map((txn) => (
            <motion.div
              key={txn.id}
              variants={LIST_ITEM}
              className="grid grid-cols-[90px_1fr_120px_70px] gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-xs text-white/50 tabular-nums">{formatDate(txn.date)}</span>
              <span className="text-sm text-white truncate" title={txn.description}>
                {txn.description}
              </span>
              <span className="text-right">
                <AmountCell amount={txn.amount} />
              </span>
              <span className="flex justify-end">
                <TypeBadge amount={txn.amount} />
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {transactions.length > 10 && (
        <p className="text-xs text-white/25 text-center">
          Showing all {transactions.length} transactions — scroll to see more
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1" disabled={isConfirming}>
          Start over
        </Button>
        <Button onClick={onConfirm} isLoading={isConfirming} className="flex-1">
          Save to my account
        </Button>
      </div>
    </motion.div>
  )
}
