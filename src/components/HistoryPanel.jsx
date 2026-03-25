import { useState, useMemo } from 'react'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatShortDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatPKR(v) {
  if (typeof v !== 'number' || isNaN(v)) return '---'
  return 'PKR ' + v.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function invId(iso, idx) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `#PP-${y}-${m}-${String(idx + 1).padStart(2, '0')}`
}

export default function HistoryPanel({ entries, onClear, onDelete, onDownloadReport }) {
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')

  const years = useMemo(() => {
    const set = new Set(entries.map((e) => new Date(e.date).getFullYear()))
    return [...set].sort((a, b) => b - a)
  }, [entries])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const d = new Date(e.date)
      if (yearFilter !== 'all' && d.getFullYear() !== Number(yearFilter)) return false
      if (monthFilter !== 'all' && d.getMonth() !== Number(monthFilter)) return false
      if (search) {
        const q = search.toLowerCase()
        const dateStr = formatDate(e.date).toLowerCase()
        const amount = e.results.finalSalary.toFixed(2)
        return dateStr.includes(q) || amount.includes(q)
      }
      return true
    })
  }, [entries, search, yearFilter, monthFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white light:text-slate-800">Earnings History</h2>
          <p className="mt-1 text-sm text-slate-400">Track and analyze your professional revenue stream over time.</p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            Clear All
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="mt-3 text-sm text-slate-500">No calculations saved yet.</p>
          <p className="mt-1 text-xs text-slate-600">Use the calculator and click "Save to History" to start tracking.</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 light:bg-slate-100 light:text-slate-700 light:border-slate-200"
              />
            </div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 light:bg-slate-100 light:text-slate-700 light:border-slate-200"
            >
              <option value="all" className="bg-slate-800">All Years</option>
              {years.map((y) => (
                <option key={y} value={y} className="bg-slate-800">Year: {y}</option>
              ))}
            </select>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 light:bg-slate-100 light:text-slate-700 light:border-slate-200"
            >
              <option value="all" className="bg-slate-800">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i} className="bg-slate-800">
                  {new Date(2000, i).toLocaleString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {/* Table header */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] gap-4 border-b border-white/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 light:border-slate-200">
              <span>Billing Period</span>
              <span>Amount</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            {filtered.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                No matching entries found.
              </div>
            ) : (
              filtered.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr] items-center gap-4 border-b border-white/5 px-5 py-4 transition-colors hover:bg-white/[0.02] last:border-b-0 light:border-slate-100 light:hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200 light:text-slate-700">
                        {formatDate(entry.date)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Inv {invId(entry.date, idx)}
                      </p>
                    </div>
                  </div>

                  <p className="text-base font-semibold tabular-nums text-slate-100 light:text-slate-800">
                    {formatPKR(entry.results.finalSalary)}
                  </p>

                  <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                    SAVED
                  </span>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-red-500/30 hover:text-red-400 light:border-slate-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Annual report card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6">
        <div className="relative">
          <h3 className="text-xl font-bold text-white">Annual Revenue Report</h3>
          <p className="mt-2 text-sm text-blue-100/80">
            {entries.length > 0
              ? `You have ${entries.length} calculation${entries.length > 1 ? 's' : ''} saved. Download your comprehensive fiscal summary.`
              : 'Your earnings data will be compiled here. Download your comprehensive fiscal summary.'}
          </p>
          <button
            onClick={onDownloadReport}
            disabled={entries.length === 0}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-50">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>
    </div>
  )
}
