import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils/formatters'
import { CATEGORY_LABELS } from '@/constants/categories'

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { category, total, pct, fill } = payload[0].payload
  return (
    <div className="bg-surface-100 border border-white/10 rounded-xl px-3 py-2 text-sm shadow-lg">
      <p className="font-medium mb-0.5" style={{ color: fill }}>
        {CATEGORY_LABELS[category] ?? category}
      </p>
      <p className="text-white tabular-nums">{formatCurrency(total)}</p>
      <p className="text-white/40 text-xs">{(pct * 100).toFixed(1)}% of spend</p>
    </div>
  )
}

export default function SpendingPieChart({ data }) {
  if (!data?.length) return null
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-white/70 mb-1">Spending by category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.category} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Mini legend — top 4 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
        {data.slice(0, 4).map((item) => (
          <div key={item.category} className="flex items-center gap-2 text-xs text-white/55">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.fill }}
            />
            <span className="truncate">{CATEGORY_LABELS[item.category] ?? item.category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
