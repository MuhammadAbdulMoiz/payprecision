import { useState, useEffect } from 'react'

export default function WageArchitecture({
  dailyWage, overtimeRate, isValid,
  globalCurrency = 'PKR', dollarRate = 1,
  aiItems = [], laptopItems = [],
}) {
  const [currency, setCurrency] = useState(globalCurrency)

  useEffect(() => { setCurrency(globalCurrency) }, [globalCurrency])

  const fmt = (v) => {
    if (!isValid || typeof v !== 'number' || isNaN(v)) return '---'
    const amount = currency === 'USD' && dollarRate > 0 ? v / dollarRate : v
    return amount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Reimbursements are stored in USD — convert to PKR if needed
  const fmtReimb = (usdAmount) => {
    const amount = currency === 'PKR' ? usdAmount * dollarRate : usdAmount
    return amount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const prefix = currency === 'USD' ? '$' : 'PKR'
  const unit = currency === 'USD' ? '$ / Day' : 'PKR / Day'

  const appliedAI = aiItems.filter(i => i.applied)
  const appliedLaptops = laptopItems.filter(i => i.applied)
  const hasReimbursements = appliedAI.length > 0 || appliedLaptops.length > 0

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 light:text-slate-600">
            Wage Architecture
          </h2>
        </div>
        <button
          onClick={() => setCurrency((c) => c === 'PKR' ? 'USD' : 'PKR')}
          aria-label={`Switch wages to ${currency === 'PKR' ? 'USD' : 'PKR'}`}
          className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:bg-white/20 hover:text-slate-200"
        >
          {currency}
        </button>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-white/10 p-4 light:border-slate-200">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Daily Rate</p>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold tabular-nums text-slate-100 light:text-slate-800">
              {prefix} {fmt(dailyWage)}
            </p>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase text-slate-500">Base Rate</p>
              <p className="text-xs text-slate-400">{unit}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-4 light:border-slate-200">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Overtime Rate</p>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold tabular-nums text-slate-100 light:text-slate-800">
              {prefix} {fmt(overtimeRate)}
            </p>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase text-slate-500">Calculated x1.5</p>
              <p className="text-xs text-slate-400">{unit}</p>
            </div>
          </div>
        </div>

        {hasReimbursements && (
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-violet-400">
              Reimbursements / mo
            </p>
            <div className="space-y-2">
              {appliedAI.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  {item.hasLogo
                    ? <img src={`/api/images/${item.id}`} alt="" className="h-5 w-5 rounded-full object-cover shrink-0" />
                    : <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                        <svg className="h-3 w-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                  }
                  <span className="flex-1 text-xs text-slate-300 truncate">{item.name}</span>
                  <span className="text-xs font-semibold text-violet-300 tabular-nums">
                    +{prefix} {fmtReimb(item.amount)}
                  </span>
                </div>
              ))}

              {appliedLaptops.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  {item.hasImage
                    ? <img src={`/api/images/${item.id}`} alt="" className="h-5 w-5 rounded object-cover shrink-0" />
                    : <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-500/20">
                        <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                        </svg>
                      </div>
                  }
                  <span className="flex-1 text-xs text-slate-300 truncate">{item.name}</span>
                  <span className="text-xs font-semibold text-emerald-300 tabular-nums">
                    +{prefix} {fmtReimb(item.monthlyAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
