import { useState } from 'react'
import { motion } from 'framer-motion'
import { FADE_IN, LIST_ITEM, STAGGER_CONTAINER } from '@/constants/animation'
import { formatCurrency, formatDate } from '@/utils/formatters'
import CategoryBadge from '@/components/transactions/CategoryBadge'
import EditCategoryModal from '@/components/transactions/EditCategoryModal'
import Button from '@/components/ui/Button'

function AmountCell({ amount }) {
  const isCredit = amount > 0
  return (
    <span className={`font-medium tabular-nums text-sm ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
      {isCredit ? '+' : '−'}{formatCurrency(amount)}
    </span>
  )
}

function SummaryStats({ transactions }) {
  const totalOut = transactions
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const totalIn = transactions
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0)

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

export default function TransactionReview({
  transactions,
  fileName,
  onConfirm,
  onCancel,
  onCategoryChange,
  isConfirming,
}) {
  const [editingTxn, setEditingTxn] = useState(null)

  function handleCategoryApply(id, category) {
    onCategoryChange(id, category)
    setEditingTxn(null)
  }

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

      <p className="text-xs text-white/30 -mt-2">
        Click any category badge to change it before saving.
      </p>

      {/* Table */}
      <div className="bg-surface-50 border border-white/5 rounded-2xl overflow-hidden">
        {/* Column headers — category hidden on smallest screens */}
        <div className="grid grid-cols-[80px_1fr_110px] sm:grid-cols-[80px_1fr_130px_110px] gap-2 px-4 py-2.5 border-b border-white/5 text-[11px] text-white/30 uppercase tracking-wide">
          <span>Date</span>
          <span>Description</span>
          <span className="hidden sm:block">Category</span>
          <span className="text-right">Amount</span>
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
              className="grid grid-cols-[80px_1fr_110px] sm:grid-cols-[80px_1fr_130px_110px] gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-xs text-white/40 tabular-nums">{formatDate(txn.date)}</span>

              <span className="text-sm text-white truncate" title={txn.description}>
                {txn.description}
              </span>

              {/* Category — desktop only in this column; mobile inline below description */}
              <span className="hidden sm:flex items-center">
                <CategoryBadge
                  category={txn.category}
                  onClick={() => setEditingTxn(txn)}
                />
              </span>

              <span className="flex justify-end">
                <AmountCell amount={txn.amount} />
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {transactions.length > 8 && (
        <p className="text-xs text-white/20 text-center">
          {transactions.length} transactions — scroll to see all
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

      {/* Edit category modal */}
      <EditCategoryModal
        isOpen={!!editingTxn}
        onClose={() => setEditingTxn(null)}
        transaction={editingTxn}
        onSave={handleCategoryApply}
        isSaving={false}
      />
    </motion.div>
  )
}
