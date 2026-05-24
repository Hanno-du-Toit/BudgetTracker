export const CATEGORIES = [
  { slug: 'groceries',     label: 'Groceries',        icon: '🛒', color: '#34d399' },
  { slug: 'dining',        label: 'Dining Out',       icon: '🍽️', color: '#f472b6' },
  { slug: 'fuel',          label: 'Fuel & Transport', icon: '⛽', color: '#fb923c' },
  { slug: 'rent',          label: 'Rent',             icon: '🏠', color: '#60a5fa' },
  { slug: 'utilities',     label: 'Utilities',        icon: '💡', color: '#facc15' },
  { slug: 'entertainment', label: 'Entertainment',    icon: '🎬', color: '#a78bfa' },
  { slug: 'shopping',      label: 'Shopping',         icon: '🛍️', color: '#e879f9' },
  { slug: 'healthcare',    label: 'Healthcare',       icon: '🏥', color: '#2dd4bf' },
  { slug: 'insurance',     label: 'Insurance',        icon: '🛡️', color: '#64748b' },
  { slug: 'banking_fees',  label: 'Banking Fees',     icon: '🏦', color: '#475569' },
  { slug: 'education',     label: 'Education',        icon: '📚', color: '#4ade80' },
  { slug: 'travel',        label: 'Travel',           icon: '✈️', color: '#fb7185' },
  { slug: 'subscriptions', label: 'Subscriptions',    icon: '📱', color: '#818cf8' },
  { slug: 'investments',      label: 'Investments',      icon: '📈', color: '#10b981' },
  { slug: 'internal_transfer', label: 'Internal Transfer', icon: '🔄', color: '#6b7280' },
  { slug: 'income',           label: 'Income',           icon: '💰', color: '#22c55e' },
  { slug: 'home_repairs',     label: 'Home Repairs',     icon: '🔧', color: '#f59e0b' },
  { slug: 'haircut',          label: 'Haircut',          icon: '✂️', color: '#ec4899' },
  { slug: 'clothing',         label: 'Clothing',         icon: '👕', color: '#8b5cf6' },
  { slug: 'other',            label: 'Other',            icon: '📦', color: '#94a3b8' },
]

export const CATEGORY_COLORS = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.color])
)

export const CATEGORY_ICONS = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.icon])
)

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.label])
)

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug)
