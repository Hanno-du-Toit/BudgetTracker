import { motion } from 'framer-motion'
import { STAGGER_CONTAINER, LIST_ITEM } from '@/constants/animation'
import TransactionRow from './TransactionRow'

export default function TransactionList({ transactions, onEditCategory, onDelete }) {
  return (
    <div className="bg-surface-50 border border-white/5 rounded-2xl overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-[72px_1fr_auto_auto] sm:grid-cols-[80px_1fr_130px_110px_36px] gap-2 px-4 py-2.5 border-b border-white/5 text-[11px] text-white/30 uppercase tracking-wide">
        <span>Date</span>
        <span>Description</span>
        <span className="hidden sm:block">Category</span>
        <span className="text-right">Amount</span>
        <span />
      </div>

      <motion.div
        variants={STAGGER_CONTAINER}
        initial="initial"
        animate="animate"
        className="divide-y divide-white/[0.04]"
      >
        {transactions.map((txn) => (
          <motion.div key={txn.id} variants={LIST_ITEM}>
            <TransactionRow
              txn={txn}
              onEditCategory={onEditCategory}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
