import { useState, useEffect, useMemo } from 'react'
import { useExpenses } from '../hooks/useExpenses'
import { useGoals } from '../hooks/useGoals'
import { useLocalStorage } from '../hooks/useLocalStorage'

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtPKR(v) {
  if (typeof v !== 'number' || isNaN(v)) return '0'
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M'
  if (v >= 1_000)     return (v / 1_000).toFixed(1) + 'K'
  return v.toLocaleString('en-PK', { maximumFractionDigits: 0 })
}

function monthLabel(iso) {
  const [y, m] = iso.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-US', { month: 'short', year: '2-digit' })
}

function lastNMonths(n) {
  const months = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    months.push(d.toISOString().slice(0, 7))
  }
  return months
}

// ─── SVG multi-line chart ────────────────────────────────────────────────────

const LINE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#06b6d4','#f97316','#ef4444','#a3e635','#e879f9','#22d3ee']

function MultiLineChart({ series, months }) {
  if (!months.length || !series.length) return null

  const W = 560, H = 180
  const PAD = { top: 16, right: 16, bottom: 28, left: 56 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom

  const allVals = series.flatMap((s) => s.values)
  const max = Math.max(...allVals, 1)
  const min = 0

  const xPos = (i) => PAD.left + (months.length > 1 ? (i / (months.length - 1)) * cW : cW / 2)
  const yPos = (v) => PAD.top + cH - ((v - min) / (max - min)) * cH

  const yTicks = [0, 0.5, 1].map((t) => ({ v: min + t * (max - min), y: PAD.top + cH - t * cH }))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="rgba(148,163,184,0.7)">
            {t.v >= 1000 ? `${(t.v / 1000).toFixed(0)}k` : Math.round(t.v)}
          </text>
        </g>
      ))}

      {/* Lines + dots */}
      {series.map((s, si) => {
        const pts = s.values.map((v, i) => ({ x: xPos(i), y: yPos(v) }))
        const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
        return (
          <g key={s.label}>
            <path d={line} fill="none" stroke={LINE_COLORS[si % LINE_COLORS.length]} strokeWidth="1.8" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill={LINE_COLORS[si % LINE_COLORS.length]} stroke="#0f172a" strokeWidth="1.5" />
            ))}
          </g>
        )
      })}

      {/* X labels */}
      {months.map((m, i) => (
        <text key={m} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="rgba(148,163,184,0.6)">
          {monthLabel(m)}
        </text>
      ))}
    </svg>
  )
}

// ─── Salary growth bar chart ─────────────────────────────────────────────────

function SalaryGrowthChart({ entries }) {
  const sorted = useMemo(() =>
    [...entries].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-12),
  [entries])

  if (sorted.length < 2) return (
    <p className="py-8 text-center text-sm text-slate-500">Need at least 2 history entries to show growth.</p>
  )

  const W = 560, H = 160
  const PAD = { top: 16, right: 16, bottom: 28, left: 56 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom

  const incomes = sorted.map((e) => parseFloat(e.params?.income) || 0)
  const max = Math.max(...incomes, 1)
  const barW = Math.max((cW / sorted.length) - 6, 8)

  const first = incomes[0], last = incomes[incomes.length - 1]
  const growth = first > 0 ? ((last - first) / first * 100) : 0

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-xs text-slate-400">Total growth:</span>
        <span className={`text-sm font-bold ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
        </span>
        <span className="text-xs text-slate-500">
          ${incomes[0].toFixed(2)} → ${incomes[incomes.length - 1].toFixed(2)} / hr
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {[0, 0.5, 1].map((t, i) => {
          const y = PAD.top + cH - t * cH
          const v = t * max
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(148,163,184,0.7)">
                ${v.toFixed(1)}
              </text>
            </g>
          )
        })}
        {sorted.map((e, i) => {
          const v = parseFloat(e.params?.income) || 0
          const x = PAD.left + (i / sorted.length) * cW + (cW / sorted.length - barW) / 2
          const bH = (v / max) * cH
          const y = PAD.top + cH - bH
          const isLast = i === sorted.length - 1
          return (
            <g key={e.id}>
              <rect x={x} y={y} width={barW} height={bH} rx="3"
                fill={isLast ? '#3b82f6' : 'rgba(59,130,246,0.35)'} />
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="8" fill="rgba(148,163,184,0.6)">
                {new Date(e.date).toLocaleString('en-US', { month: 'short', year: '2-digit' })}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Net worth tracker ────────────────────────────────────────────────────────

const DEBT_KEY = 'pp-debts'

function DebtRow({ debt, onPay, onEdit, onRemove }) {
  const [mode, setMode] = useState(null) // null | 'pay' | 'edit'
  const [payAmt, setPayAmt] = useState('')
  const [editName, setEditName] = useState(debt.name)
  const [editAmt, setEditAmt] = useState(String(debt.remaining ?? debt.amount))

  const remaining = debt.remaining ?? debt.amount
  const original  = debt.amount
  const paid      = original - remaining
  const progress  = original > 0 ? Math.min((paid / original) * 100, 100) : 0
  const isPaid    = remaining <= 0

  const handlePay = (e) => {
    e.preventDefault()
    const p = Math.min(Number(payAmt), remaining)
    if (p > 0) { onPay(debt.id, p); setPayAmt(''); setMode(null) }
  }

  const handleEdit = (e) => {
    e.preventDefault()
    onEdit(debt.id, editName.trim() || debt.name, Number(editAmt) || debt.amount)
    setMode(null)
  }

  return (
    <div className={`rounded-lg px-3 py-2.5 ${isPaid ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
      {/* Main row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {isPaid && (
            <span className="shrink-0 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">Paid</span>
          )}
          <span className={`text-sm truncate ${isPaid ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{debt.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className={`text-sm font-semibold tabular-nums ${isPaid ? 'text-slate-600' : 'text-red-400'}`}>
            {isPaid ? 'PKR 0' : `-PKR ${fmtPKR(remaining)}`}
          </span>
          {!isPaid && (
            <button onClick={() => setMode(mode === 'pay' ? null : 'pay')}
              className="rounded bg-emerald-700/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-600/60">
              Pay
            </button>
          )}
          <button onClick={() => setMode(mode === 'edit' ? null : 'edit')}
            className="text-slate-600 hover:text-slate-300 text-[10px] px-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button onClick={() => onRemove(debt.id)}
            className="text-slate-600 hover:text-red-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {original > 0 && paid > 0 && (
        <div className="mt-1.5">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-500/60 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-0.5 flex justify-between text-[9px] text-slate-600">
            <span>Paid PKR {fmtPKR(paid)}</span>
            <span>{Math.round(progress)}% done</span>
          </div>
        </div>
      )}

      {/* Pay form */}
      {mode === 'pay' && (
        <form onSubmit={handlePay} className="mt-2 flex gap-1.5">
          <input type="number" min="1" max={remaining} placeholder={`Max ${fmtPKR(remaining)}`}
            value={payAmt} onChange={(e) => setPayAmt(e.target.value)} autoFocus required
            className="flex-1 rounded border border-emerald-500/30 bg-emerald-900/20 px-2 py-1 text-xs text-white outline-none focus:border-emerald-400/60" />
          <button type="submit" className="rounded bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600">Confirm</button>
          <button type="button" onClick={() => setMode(null)} className="rounded px-2 py-1 text-xs text-slate-500 hover:text-white">✕</button>
        </form>
      )}

      {/* Edit form */}
      {mode === 'edit' && (
        <form onSubmit={handleEdit} className="mt-2 flex gap-1.5">
          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name"
            className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-blue-400/50" />
          <input type="number" min="1" value={editAmt} onChange={(e) => setEditAmt(e.target.value)} placeholder="Remaining"
            className="w-28 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-blue-400/50" />
          <button type="submit" className="rounded bg-blue-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-600">Save</button>
          <button type="button" onClick={() => setMode(null)} className="rounded px-2 py-1 text-xs text-slate-500 hover:text-white">✕</button>
        </form>
      )}
    </div>
  )
}

function NetWorthTracker({ goals, finalSalary }) {
  const [debts, setDebts] = useLocalStorage(DEBT_KEY, [])
  const [dName, setDName] = useState('')
  const [dAmount, setDAmount] = useState('')
  const [showPaid, setShowPaid] = useState(false)

  const totalAssets = goals.reduce((s, g) => s + (g.savedAmount || 0), 0)
  const totalDebts  = debts.reduce((s, d) => s + ((d.remaining ?? d.amount) || 0), 0)
  const netWorth    = totalAssets - totalDebts
  const positive    = netWorth >= 0

  const addDebt = (e) => {
    e.preventDefault()
    if (!dName.trim() || !dAmount) return
    const amt = Number(dAmount)
    setDebts((prev) => [...prev, { id: Date.now().toString(36), name: dName, amount: amt, remaining: amt }])
    setDName(''); setDAmount('')
  }

  const removeDebt = (id) => setDebts((prev) => prev.filter((d) => d.id !== id))

  const payDebt = (id, payment) => {
    setDebts((prev) => prev.map((d) => {
      if (d.id !== id) return d
      const remaining = Math.max((d.remaining ?? d.amount) - payment, 0)
      return { ...d, remaining }
    }))
  }

  const editDebt = (id, name, remaining) => {
    setDebts((prev) => prev.map((d) => {
      if (d.id !== id) return d
      const newAmt = remaining > (d.amount || 0) ? remaining : d.amount
      return { ...d, name, amount: newAmt, remaining }
    }))
  }

  const activeDebts = debts.filter((d) => (d.remaining ?? d.amount) > 0)
  const paidDebts   = debts.filter((d) => (d.remaining ?? d.amount) <= 0)

  const maxBar = Math.max(totalAssets, totalDebts, 1)
  const assetsPct = (totalAssets / maxBar) * 100
  const debtsPct  = (totalDebts  / maxBar) * 100

  return (
    <div className="space-y-4">
      {/* Net worth headline */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Assets',  value: totalAssets, color: 'text-emerald-400' },
          { label: 'Total Debts',   value: totalDebts,  color: 'text-red-400' },
          { label: 'Net Worth',     value: netWorth,    color: positive ? 'text-blue-400' : 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/5 p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
            <p className={`mt-1 text-sm font-bold tabular-nums ${s.color}`}>
              {s.value < 0 ? '-' : ''}PKR {fmtPKR(Math.abs(s.value))}
            </p>
          </div>
        ))}
      </div>

      {/* Visual bars */}
      <div className="space-y-2">
        <div>
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="text-emerald-400 font-medium">Assets (Goal savings)</span>
            <span className="text-slate-400">PKR {fmtPKR(totalAssets)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${assetsPct}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="text-red-400 font-medium">Liabilities (Debts)</span>
            <span className="text-slate-400">PKR {fmtPKR(totalDebts)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-red-500 transition-all duration-700" style={{ width: `${debtsPct}%` }} />
          </div>
        </div>
      </div>

      {/* Debts list */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Liabilities · {activeDebts.length} active
        </p>
        {activeDebts.length === 0 && paidDebts.length === 0 ? (
          <p className="text-[12px] text-slate-600">No debts added yet.</p>
        ) : (
          <div className="space-y-1.5">
            {activeDebts.map((d) => (
              <DebtRow key={d.id} debt={d} onPay={payDebt} onEdit={editDebt} onRemove={removeDebt} />
            ))}
            {paidDebts.length > 0 && (
              <button onClick={() => setShowPaid((v) => !v)}
                className="mt-1 text-[11px] text-slate-600 hover:text-slate-400">
                {showPaid ? '▾ Hide paid' : `▸ Show ${paidDebts.length} paid off`}
              </button>
            )}
            {showPaid && paidDebts.map((d) => (
              <DebtRow key={d.id} debt={d} onPay={payDebt} onEdit={editDebt} onRemove={removeDebt} />
            ))}
          </div>
        )}
        <form onSubmit={addDebt} className="mt-3 flex gap-2">
          <input type="text" placeholder="Liability name" value={dName}
            onChange={(e) => setDName(e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500/40" />
          <input type="number" min="1" placeholder="Amount (PKR)" value={dAmount}
            onChange={(e) => setDAmount(e.target.value)}
            className="w-32 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500/40" />
          <button type="submit"
            className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600">
            Add
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const EXPENSE_CATS = ['Housing','Food','Transport','Subscriptions','Trips','Treats','Utilities','Healthcare','Education','Shopping','Other']
const CAT_COLORS   = ['#3b82f6','#10b981','#f59e0b','#7c3aed','#0ea5e9','#ec4899','#06b6d4','#ef4444','#6366f1','#f97316','#64748b']

export default function InsightsPage({ entries, finalSalary }) {
  const { expenses } = useExpenses()
  const { goals }    = useGoals()
  const [months6]    = useState(() => lastNMonths(6))
  const [activeCats, setActiveCats] = useState(() => new Set(EXPENSE_CATS.slice(0, 5)))

  const toggleCat = (cat) => setActiveCats((prev) => {
    const next = new Set(prev)
    next.has(cat) ? next.delete(cat) : next.add(cat)
    return next
  })

  // Expense trend series — one line per selected category
  const trendSeries = useMemo(() =>
    EXPENSE_CATS
      .filter((c) => activeCats.has(c))
      .map((cat, i) => ({
        label: cat,
        color: CAT_COLORS[EXPENSE_CATS.indexOf(cat)],
        values: months6.map((m) =>
          expenses.filter((e) => e.month === m && e.category === cat)
            .reduce((s, e) => s + e.amount, 0)
        ),
      }))
      .filter((s) => s.values.some((v) => v > 0)),
  [expenses, months6, activeCats])

  // Total spending per month (for combined line)
  const totalSeries = useMemo(() => [{
    label: 'Total',
    values: months6.map((m) =>
      expenses.filter((e) => e.month === m).reduce((s, e) => s + e.amount, 0)
    ),
  }], [expenses, months6])

  const hasExpenses = expenses.some((e) => months6.includes(e.month))

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h2 className="text-2xl font-extrabold text-white">Insights</h2>
        <p className="mt-1 text-sm text-slate-400">Trends, growth, and your financial picture over time.</p>
      </div>

      {/* ── Expense Trend Chart ── */}
      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Expense Trends</h3>
            <p className="text-[11px] text-slate-500">Last 6 months by category</p>
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {EXPENSE_CATS.map((cat, i) => (
            <button key={cat} onClick={() => toggleCat(cat)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors border ${
                activeCats.has(cat)
                  ? 'border-transparent text-white'
                  : 'border-white/10 text-slate-500 hover:text-slate-300'
              }`}
              style={activeCats.has(cat) ? { backgroundColor: CAT_COLORS[i] + '33', borderColor: CAT_COLORS[i] + '66', color: CAT_COLORS[i] } : {}}>
              {cat}
            </button>
          ))}
        </div>

        {!hasExpenses ? (
          <p className="py-8 text-center text-sm text-slate-500">No expenses recorded in the last 6 months.</p>
        ) : trendSeries.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Select at least one category above.</p>
        ) : (
          <>
            <MultiLineChart series={trendSeries} months={months6} />
            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-3">
              {trendSeries.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-[11px] text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Total monthly spend trend ── */}
      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20">
            <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"/><polyline points="7 16 11 12 15 16 19 8"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Total Monthly Spending</h3>
            <p className="text-[11px] text-slate-500">All categories combined</p>
          </div>
        </div>
        {!hasExpenses ? (
          <p className="py-8 text-center text-sm text-slate-500">No expense data yet.</p>
        ) : (
          <>
            <MultiLineChart series={totalSeries} months={months6} />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {months6.slice(-3).map((m) => {
                const spent = expenses.filter((e) => e.month === m).reduce((s, e) => s + e.amount, 0)
                return (
                  <div key={m} className="rounded-xl bg-white/5 p-2.5 text-center">
                    <p className="text-[10px] text-slate-500">{monthLabel(m)}</p>
                    <p className="mt-1 text-xs font-bold text-red-400">PKR {fmtPKR(spent)}</p>
                    {finalSalary > 0 && (
                      <p className="text-[10px] text-slate-600">{((spent / finalSalary) * 100).toFixed(0)}% of salary</p>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Salary growth chart ── */}
      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Salary Growth</h3>
            <p className="text-[11px] text-slate-500">Hourly rate over saved history entries</p>
          </div>
        </div>
        <SalaryGrowthChart entries={entries} />
      </div>

      {/* ── Net worth tracker ── */}
      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20">
            <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Net Worth</h3>
            <p className="text-[11px] text-slate-500">Goal savings minus your debts/liabilities</p>
          </div>
        </div>
        <NetWorthTracker goals={goals} finalSalary={finalSalary} />
      </div>
    </div>
  )
}
