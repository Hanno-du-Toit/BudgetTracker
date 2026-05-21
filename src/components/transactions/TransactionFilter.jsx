import { CATEGORIES } from '@/constants/categories'

function formatMonthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-')
  return new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

const selectClass =
  'bg-surface-100 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white ' +
  'focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand ' +
  'transition-colors duration-150 cursor-pointer appearance-none'

export default function TransactionFilter({
  search,      onSearch,
  category,    onCategory,
  month,       onMonth,
  sort,        onSort,
  availableMonths,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative sm:flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search transactions…"
          className="input-base pl-8 py-2.5 sm:py-3"
        />
      </div>

      {/* Category + Month: 2-col grid on mobile, transparent on desktop */}
      <div className="grid grid-cols-2 sm:contents gap-3">
        {/* Category */}
        <select
          value={category}
          onChange={(e) => onCategory(e.target.value)}
          className={selectClass}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>
          ))}
        </select>

        {/* Month */}
        <select
          value={month}
          onChange={(e) => onMonth(e.target.value)}
          className={selectClass}
          aria-label="Filter by month"
        >
          <option value="">All months</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>{formatMonthLabel(m)}</option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value)}
        className={selectClass}
        aria-label="Sort transactions"
      >
        <option value="transaction_date-desc">Date: Newest first</option>
        <option value="transaction_date-asc">Date: Oldest first</option>
        <option value="amount-asc">Amount: Largest expense first</option>
        <option value="amount-desc">Amount: Largest income first</option>
      </select>
    </div>
  )
}
