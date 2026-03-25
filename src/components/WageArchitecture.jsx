export default function WageArchitecture({ dailyWage, overtimeRate, isValid }) {
  const formatVal = (v) =>
    isValid && typeof v === 'number' && !isNaN(v)
      ? v.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '---'

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
          <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 light:text-slate-600">
          Wage Architecture
        </h2>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-white/10 p-4 light:border-slate-200">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Daily Rate</p>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold tabular-nums text-slate-100 light:text-slate-800">
              PKR {formatVal(dailyWage)}
            </p>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase text-slate-500">Base Rate</p>
              <p className="text-xs text-slate-400">PKR / Day</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-4 light:border-slate-200">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Overtime Rate</p>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold tabular-nums text-slate-100 light:text-slate-800">
              PKR {formatVal(overtimeRate)}
            </p>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase text-slate-500">Calculated x1.5</p>
              <p className="text-xs text-slate-400">PKR / Day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
