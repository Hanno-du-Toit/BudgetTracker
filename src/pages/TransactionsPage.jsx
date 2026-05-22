import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTransactions } from '@/hooks/useTransactions'
import { useToast } from '@/context/ToastContext'
import { ROUTES } from '@/constants/routes'
import { SEARCH_DEBOUNCE_MS } from '@/constants/limits'
import { FADE_IN } from '@/constants/animation'
import { formatDate } from '@/utils/formatters'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'
import TransactionFilter from '@/components/transactions/TransactionFilter'
import TransactionList from '@/components/transactions/TransactionList'
import EditCategoryModal from '@/components/transactions/EditCategoryModal'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden animate-pulse">
      <div className="h-10 border-b border-white/5 px-4 flex items-center gap-6">
        {[64, 200, 100, 80].map((w, i) => (
          <div key={i} className="h-2.5 bg-white/5 rounded-full" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-12 border-b border-white/[0.03] px-4 flex items-center gap-6">
          {[60, 180, 90, 70].map((w, j) => (
            <div key={j} className="h-2.5 bg-white/[0.04] rounded-full" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Uploads panel ─────────────────────────────────────────────────────────────

function UploadsPanel({ statements, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card mb-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm text-white/60 hover:text-white transition-colors"
      >
        <span className="font-medium">
          Manage uploads
          <span className="ml-2 text-white/30 font-normal">
            ({statements.length} file{statements.length !== 1 ? 's' : ''})
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/30 text-lg leading-none"
        >
          ˅
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="uploads"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 flex flex-col gap-2">
              {statements.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 bg-white/[0.05] border border-white/[0.06] rounded-xl px-3 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-white/30 shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.05]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{s.file_name}</p>
                      <p className="text-xs text-white/35 mt-0.5">
                        {s.statement_month} · {s.transaction_count} transaction{s.transaction_count !== 1 ? 's' : ''}
                        {s.uploaded_at ? ` · uploaded ${formatDate(s.uploaded_at.slice(0, 10))}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(s)}
                    className="shrink-0 text-xs text-white/25 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-400/10 whitespace-nowrap"
                  >
                    Delete all
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const navigate  = useNavigate()
  const { toast } = useToast()
  const { loadTransactions, loadAvailableMonths, loadStatements, updateCategory, deleteTransaction, deleteStatement } =
    useTransactions()

  const [searchParams] = useSearchParams()

  // Filter state
  const [search,    setSearch]    = useState('')
  const [debSearch, setDebSearch] = useState('')
  const [category,  setCategory]  = useState(() => searchParams.get('category') ?? '')
  const [month,     setMonth]     = useState('')
  const [sort,      setSort]      = useState('transaction_date-desc')

  // Data state
  const [transactions, setTransactions] = useState([])
  const [statements,   setStatements]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  // Modal / confirm state
  const [editingTxn,        setEditingTxn]        = useState(null)
  const [isSavingCategory,  setIsSavingCategory]  = useState(false)
  const [pendingDeleteTxn,  setPendingDeleteTxn]  = useState(null)
  const [pendingDeleteStmt, setPendingDeleteStmt] = useState(null)
  const [isDeleting,        setIsDeleting]        = useState(false)

  // Decode combined sort value — split on the LAST '-' so 'transaction_date-desc' works
  const lastDash = sort.lastIndexOf('-')
  const sortBy   = sort.slice(0, lastDash)
  const sortDir  = sort.slice(lastDash + 1)

  const filtersActive                       = !!(debSearch || category || month)
  const [availableMonths, setAvailableMonths] = useState([])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  // Load transactions whenever any filter changes
  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    loadTransactions({ search: debSearch, category, month, sortBy, sortDir })
      .then((data) => { setTransactions(data); setLoading(false) })
      .catch((err)  => { setError(err.message); setLoading(false) })
  }, [debSearch, category, month, sortBy, sortDir, loadTransactions])

  useEffect(() => { reload() }, [reload])

  // Load statements and available months once on mount
  useEffect(() => {
    loadStatements().then(setStatements).catch(console.error)
  }, [loadStatements])

  useEffect(() => {
    loadAvailableMonths().then(setAvailableMonths).catch(console.error)
  }, [loadAvailableMonths])

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleCategoryApply(id, newCategory) {
    setIsSavingCategory(true)
    try {
      await updateCategory(id, newCategory, editingTxn.description)
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, category: newCategory } : t))
      )
      setEditingTxn(null)
      toast.success('Category updated.')
    } catch {
      toast.error('Failed to update category. Please try again.')
    } finally {
      setIsSavingCategory(false)
    }
  }

  async function handleConfirmDeleteTxn() {
    setIsDeleting(true)
    try {
      await deleteTransaction(pendingDeleteTxn.id)
      setTransactions((prev) => prev.filter((t) => t.id !== pendingDeleteTxn.id))
      setStatements((prev) =>
        prev.map((s) =>
          s.id === pendingDeleteTxn.statement_id
            ? { ...s, transaction_count: Math.max(0, s.transaction_count - 1) }
            : s
        )
      )
      toast.success('Transaction deleted.')
      setPendingDeleteTxn(null)
    } catch {
      toast.error('Failed to delete transaction. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleConfirmDeleteStmt() {
    setIsDeleting(true)
    try {
      await deleteStatement(pendingDeleteStmt.id)
      setTransactions((prev) => prev.filter((t) => t.statement_id !== pendingDeleteStmt.id))
      setStatements((prev) => prev.filter((s) => s.id !== pendingDeleteStmt.id))
      toast.success(`Deleted ${pendingDeleteStmt.transaction_count} transactions from "${pendingDeleteStmt.file_name}".`)
      setPendingDeleteStmt(null)
    } catch {
      toast.error('Failed to delete upload. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const noneAtAll = !loading && !error && transactions.length === 0 && !filtersActive && statements.length === 0
  const noneFound = !loading && !error && transactions.length === 0 && filtersActive

  return (
    <AppShell>
      <PageWrapper className="max-w-4xl mx-auto px-4 pt-4 pb-8 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            {!loading && (
              <motion.p {...FADE_IN} className="text-white/40 text-sm mt-0.5">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                {filtersActive ? ' matching filters' : ''}
              </motion.p>
            )}
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate(ROUTES.UPLOAD)}>
            + Upload
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-5">
          <TransactionFilter
            search={search}       onSearch={setSearch}
            category={category}   onCategory={setCategory}
            month={month}         onMonth={setMonth}
            sort={sort}           onSort={setSort}
            availableMonths={availableMonths}
          />
        </div>

        {/* Error */}
        {error && (
          <motion.p {...FADE_IN} className="text-red-400 text-sm mb-4 px-1">{error}</motion.p>
        )}

        {/* Manage uploads panel */}
        {statements.length > 0 && !noneAtAll && (
          <UploadsPanel statements={statements} onDelete={setPendingDeleteStmt} />
        )}

        {/* First-time empty state */}
        {noneAtAll && (
          <EmptyState
            icon="📋"
            heading="No transactions yet"
            subtext="Upload your first bank statement to start tracking your spending."
            action={{ label: 'Upload a statement', onClick: () => navigate(ROUTES.UPLOAD) }}
          />
        )}

        {/* No results for active filters */}
        {noneFound && (
          <motion.div {...FADE_IN} className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-white font-semibold mb-2">No transactions found</p>
            <p className="text-white/40 text-sm mb-5">Try adjusting your search or filters.</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setSearch(''); setCategory(''); setMonth('') }}
            >
              Clear filters
            </Button>
          </motion.div>
        )}

        {/* Loading */}
        {loading && <SkeletonRows />}

        {/* Transaction list */}
        {!loading && transactions.length > 0 && (
          <TransactionList
            transactions={transactions}
            onEditCategory={(txn) => setEditingTxn(txn)}
            onDelete={(txn)       => setPendingDeleteTxn(txn)}
          />
        )}

        {/* Edit category modal */}
        <EditCategoryModal
          isOpen={!!editingTxn}
          onClose={() => setEditingTxn(null)}
          transaction={editingTxn}
          onSave={handleCategoryApply}
          isSaving={isSavingCategory}
        />

        {/* Confirm: delete single transaction */}
        <ConfirmDialog
          isOpen={!!pendingDeleteTxn}
          onClose={() => setPendingDeleteTxn(null)}
          onConfirm={handleConfirmDeleteTxn}
          title="Delete transaction"
          message={`Remove "${pendingDeleteTxn?.description}" from your account? This cannot be undone.`}
          confirmLabel="Delete"
          isDangerous
          isLoading={isDeleting}
        />

        {/* Confirm: delete entire statement */}
        <ConfirmDialog
          isOpen={!!pendingDeleteStmt}
          onClose={() => setPendingDeleteStmt(null)}
          onConfirm={handleConfirmDeleteStmt}
          title="Delete upload"
          message={`This will permanently delete all ${pendingDeleteStmt?.transaction_count} transactions from "${pendingDeleteStmt?.file_name}". This cannot be undone.`}
          confirmLabel="Delete all"
          isDangerous
          isLoading={isDeleting}
        />

      </PageWrapper>
    </AppShell>
  )
}
