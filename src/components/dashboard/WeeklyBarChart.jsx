import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell,
} from 'recharts'
import { formatCurrency } from '@/utils/formatters'

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-100 border border-white/10 rounded-xl px-3 py-2 text-sm shadow-lg">
      <p className="text-white/50 mb-0.5">{label}</p>
      <p className="text-white font-medium tabular-nums">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

function yTick(v) {
  if (v === 0) return 'R0'
  if (v >= 1000) return `R${(v / 1000).toFixed(0)}k`
  return `R${v}`
}

export default function WeeklyBarChart({ weekData, monthData }) {
  const [view, setView] = useState('weekly')

  const data    = view === 'weekly' ? weekData : monthData
  const dataKey = view === 'weekly' ? 'week' : 'label'

  const max = data.length ? Math.max(...data.map((d) => d.spend), 1) : 1

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-white/70">
          {view === 'weekly' ? 'Spending by week' : 'Spending by month'}
        </h3>
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
          <button
            onClick={() => setView('weekly')}
            className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors ${
              view === 'weekly'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setView('monthly')}
            className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors ${
              view === 'monthly'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
          No data available
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={view === 'monthly' ? 20 : 36} margin={{ top: 12, right: 4, bottom: 0, left: -8 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey={dataKey}
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={yTick}
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry[dataKey]}
                    fill={entry.spend === max ? '#7c5cfc' : 'rgba(124,92,252,0.3)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
