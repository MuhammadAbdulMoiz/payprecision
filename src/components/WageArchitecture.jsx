import { useState, useEffect } from 'react'

export default function WageArchitecture({
  dailyWage, overtimeRate, isValid,
  globalCurrency = 'PKR', dollarRate = 1,
  aiItems = [], laptopItems = [],
  annualBonusPKR = 0, annualBonusMode = 'fixed', annualBonusValue = '',
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

        {annualBonusPKR > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-amber-400">
              Annual Bonus{annualBonusMode === 'percent' ? ` (${annualBonusValue}%)` : ''}
            </p>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-extrabold tabular-nums text-slate-100 light:text-slate-800">
                {prefix} {fmtReimb(annualBonusPKR)}
              </p>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase text-slate-500">One-time</p>
                <p className="text-xs text-amber-400">{currency === 'USD' ? '$ total' : 'PKR total'}</p>
              </div>
            </div>
          </div>
        )}

        {appliedAI.map(item => (
          <div key={item.id} className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              {item.hasLogo
                ? <img src={`/api/images/${item.id}`} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
                : <div className="h-4 w-4 shrink-0 rounded-full bg-violet-500/30" />
              }
              <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 truncate">{item.name}</p>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-extrabold tabular-nums text-slate-100 light:text-slate-800">
                {prefix} {fmtReimb(item.amount)}
              </p>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase text-slate-500">AI Reimb.</p>
                <p className="text-xs text-violet-400">{currency === 'USD' ? '$ / mo' : 'PKR / mo'}</p>
              </div>
            </div>
          </div>
        ))}

        {appliedLaptops.map(item => (
          <div key={item.id} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              {item.hasImage
                ? <img src={`/api/images/${item.id}`} alt="" className="h-4 w-4 rounded object-cover shrink-0" />
                : <div className="h-4 w-4 shrink-0 rounded bg-emerald-500/30" />
              }
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400 truncate">{item.name}</p>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-extrabold tabular-nums text-slate-100 light:text-slate-800">
                {prefix} {fmtReimb(item.monthlyAmount)}
              </p>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase text-slate-500">Laptop Reimb.</p>
                <p className="text-xs text-emerald-400">{currency === 'USD' ? '$ / mo' : 'PKR / mo'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
