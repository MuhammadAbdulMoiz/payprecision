import InputField from './InputField'

const BONUS_OPTIONS = [
  { key: '1month', label: '1 Month', fixed: false },
  { key: '3months', label: '3 Months', amount: 10000, fixed: true },
  { key: '6months', label: '6 Months', amount: 20000, fixed: true },
]

export default function VariablesAdjustments({
  extraDays, onExtraDaysChange,
  leaveDays, onLeaveDaysChange,
  attendanceBonuses, onAttendanceBonusesChange,
  bonus1Month, onBonus1MonthChange,
  bonus1MonthCurrency, onBonus1MonthCurrencyChange,
  dollarRate,
  errors,
  annualBonus, onAnnualBonusChange,
  annualBonusCurrency, onAnnualBonusCurrencyChange,
}) {
  const toggleBonus = (key) => {
    onAttendanceBonusesChange((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // Returns PKR amount for display purposes (bonus1Month may be in USD)
  const getDisplayAmount = (opt) => {
    if (opt.fixed) return opt.amount
    const raw = Number(bonus1Month) || 0
    return bonus1MonthCurrency === 'USD' ? raw * (dollarRate || 1) : raw
  }

  const totalBonus = attendanceBonuses.reduce((sum, key) => {
    const opt = BONUS_OPTIONS.find((o) => o.key === key)
    return sum + (opt ? getDisplayAmount(opt) : 0)
  }, 0)

  const is1MonthActive = attendanceBonuses.includes('1month')

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
          <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v18m-6-6l6 6 6-6" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 light:text-slate-600">
          Variables & Adjustments
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 light:bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 light:text-slate-700">Extra days multiplier</p>
              <p className="text-[11px] text-slate-500">1.5x rate, or 1x if offsetting leave</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-300">Bonus</span>
            <span className="text-lg font-bold tabular-nums text-slate-200 light:text-slate-700">1.5</span>
          </div>
        </div>

        <InputField
          label="Extra Working Days"
          value={extraDays}
          onChange={onExtraDaysChange}
          error={errors.extraDays}
          tooltip="Overtime days (1.5x rate). If leaves exist, extra days offset them at 1x first."
        />

        <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 light:bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 light:text-slate-700">Leave days (unpaid)</p>
              <p className="text-[11px] text-slate-500">Offset by extra days, remainder deducted</p>
            </div>
          </div>
          <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-300">Deduction</span>
        </div>

        <InputField
          label="Leave Days"
          value={leaveDays}
          onChange={onLeaveDaysChange}
          error={errors.leaveDays}
          tooltip="Unpaid leave days. Extra days offset these first (cancel out)."
        />

        {/* Perfect Attendance Bonus */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 light:text-slate-700">Perfect Attendance Bonus</p>
              <p className="text-[11px] text-slate-500">1-month is editable · others are fixed</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {BONUS_OPTIONS.map((opt) => {
              const active = attendanceBonuses.includes(opt.key)
              const displayPKR = getDisplayAmount(opt)
              return (
                <button
                  key={opt.key}
                  onClick={() => toggleBonus(opt.key)}
                  className={`relative rounded-lg px-2 py-2.5 text-center transition-all ${
                    active
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200'
                  }`}
                >
                  {active && (
                    <svg className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <p className="text-[11px] font-medium">{opt.label}</p>
                  <p className={`text-xs font-bold tabular-nums ${active ? 'text-emerald-100' : 'text-slate-300 light:text-slate-700'}`}>
                    +{Math.round(displayPKR).toLocaleString()}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Editable 1-month amount with currency toggle */}
          {is1MonthActive && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                  1-Month Bonus Amount
                </label>
                <button
                  onClick={() => onBonus1MonthCurrencyChange((c) => c === 'PKR' ? 'USD' : 'PKR')}
                  className="rounded px-2 py-0.5 text-[10px] font-bold transition-colors bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                >
                  {bonus1MonthCurrency}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-400">
                  {bonus1MonthCurrency === 'USD' ? '$' : '₨'}
                </span>
                <input
                  type="number"
                  min="0"
                  value={bonus1Month}
                  onChange={(e) => onBonus1MonthChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 pl-7 pr-3 py-1.5 text-sm font-semibold text-emerald-200 outline-none focus:border-emerald-400/60 focus:bg-emerald-500/15 transition-colors"
                />
              </div>
              {bonus1MonthCurrency === 'USD' && (
                <p className="mt-1 text-[10px] text-emerald-400/70">
                  ≈ PKR {Math.round((Number(bonus1Month) || 0) * (dollarRate || 1)).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {totalBonus > 0 && (
            <p className="mt-2 text-[11px] text-emerald-400">
              Total bonus: +PKR {Math.round(totalBonus).toLocaleString()} added to final salary
            </p>
          )}
        </div>

        {/* Annual Bonus */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20">
              <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 light:text-slate-700">Annual Bonus</p>
              <p className="text-[11px] text-slate-500">One-time bonus — shown on invoice only</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                Bonus Amount
              </label>
              <button
                onClick={() => onAnnualBonusCurrencyChange((c) => c === 'PKR' ? 'USD' : 'PKR')}
                className="rounded px-2 py-0.5 text-[10px] font-bold transition-colors bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
              >
                {annualBonusCurrency}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-amber-400">
                {annualBonusCurrency === 'USD' ? '$' : '₨'}
              </span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={annualBonus}
                onChange={(e) => onAnnualBonusChange(e.target.value)}
                className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 pl-7 pr-3 py-1.5 text-sm font-semibold text-amber-200 outline-none focus:border-amber-400/60 focus:bg-amber-500/15 transition-colors placeholder:text-amber-900"
              />
            </div>
            {annualBonusCurrency === 'USD' && annualBonus && (
              <p className="mt-1 text-[10px] text-amber-400/70">
                ≈ PKR {Math.round((Number(annualBonus) || 0) * (dollarRate || 1)).toLocaleString()}
              </p>
            )}
            {annualBonus && Number(annualBonus) > 0 && (
              <p className="mt-1 text-[11px] text-amber-400">
                Will appear as a bonus line on your invoice
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
