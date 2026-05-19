import { motion } from 'framer-motion'
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/constants/categories'

export default function CategoryBadge({ category, onClick, size = 'sm' }) {
  const color  = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other
  const icon   = CATEGORY_ICONS[category]  ?? CATEGORY_ICONS.other
  const label  = CATEGORY_LABELS[category] ?? 'Other'

  const sizeClass = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5'

  const Tag = onClick ? motion.button : motion.span

  return (
    <Tag
      onClick={onClick}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      className={`
        inline-flex items-center rounded-full font-medium border transition-opacity
        ${sizeClass}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
      `}
      style={{
        color,
        backgroundColor: `${color}18`,
        borderColor:      `${color}30`,
      }}
      title={onClick ? `Change category (currently: ${label})` : label}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Tag>
  )
}
