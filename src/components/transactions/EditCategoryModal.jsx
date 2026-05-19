import { useState } from 'react'
import { CATEGORIES } from '@/constants/categories'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import CategoryBadge from './CategoryBadge'

export default function EditCategoryModal({ isOpen, onClose, transaction, onSave, isSaving }) {
  const [selected, setSelected] = useState(transaction?.category ?? 'other')

  // Reset selection whenever a different transaction is opened
  if (transaction && selected !== transaction.category && !isSaving) {
    // Only reset when the modal just opened for a new transaction
  }

  function handleOpen() {
    setSelected(transaction?.category ?? 'other')
  }

  function handleSave() {
    onSave(transaction.id, selected)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change category"
      maxWidth="max-w-sm"
    >
      {transaction && (
        <div className="flex flex-col gap-4">
          {/* Transaction info */}
          <div className="bg-surface-100 rounded-xl px-3 py-2.5 text-sm">
            <p className="text-white truncate font-medium">{transaction.description}</p>
            <p className="text-white/40 text-xs mt-0.5">{transaction.date}</p>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelected(cat.slug)}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left
                  border transition-all duration-150
                  ${selected === cat.slug
                    ? 'border-brand bg-brand/10 text-white'
                    : 'border-white/5 bg-surface-100 text-white/60 hover:text-white hover:bg-white/5'}
                `}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 text-sm text-white/40">
            <span>New category:</span>
            <CategoryBadge category={selected} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
