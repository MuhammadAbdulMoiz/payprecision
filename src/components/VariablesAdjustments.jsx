import InputField from './InputField'

const BONUS_OPTIONS = [
  { key: '1month', label: '1 Month', amount: 4000 },
  { key: '3months', label: '3 Months', amount: 10000 },
  { key: '6months', label: '6 Months', amount: 20000 },
]

export default function VariablesAdjustments({
  extraDays, onExtraDaysChange,
  leaveDays, onLeaveDaysChange,
  attendanceBonuses, onAttendanceBonusesChange,
  errors,
}) {
  const toggleBonus = (key) => {
    onAttendanceBonusesChange((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const totalBonus = attendanceBonuses.reduce((sum, key) => {
    const opt = BONUS_OPTIONS.find((o) => o.key === key)
    return sum + (opt ? opt.amount : 0)
  }, 0)

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

        {/* Perfect Attendance Bonus - Multi-select */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 light:text-slate-700">Perfect Attendance Bonus</p>
              <p className="text-[11px] text-slate-500">Select all that apply (multi-select)</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {BONUS_OPTIONS.map((opt) => {
              const active = attendanceBonuses.includes(opt.key)
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
                  <p className={`text-xs font-bold tabular-nums ${
                    active ? 'text-emerald-100' : 'text-slate-300 light:text-slate-700'
                  }`}>
                    +{opt.amount.toLocaleString()}
                  </p>
                </button>
              )
            })}
          </div>

          {totalBonus > 0 && (
            <p className="mt-2 text-[11px] text-emerald-400">
              Total bonus: +PKR {totalBonus.toLocaleString()} added to final salary
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
