import { useState } from 'react'

function fmtCurrency(v, currency, dollarRate) {
  if (typeof v !== 'number' || isNaN(v)) return '---'
  const amount = currency === 'USD' && dollarRate > 0 ? v / dollarRate : v
  const prefix = currency === 'USD' ? '$' : 'PKR '
  return prefix + amount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function FormulaPanel({
  results, isValid, currency = 'PKR', dollarRate = 1, employeeType = 'intern',
  reimbursementPKR = 0, aiItems = [], laptopItems = [],
  annualBonusPKR = 0, annualBonusMode = 'fixed', annualBonusValue = '',
}) {
  const [open, setOpen] = useState(false)

  const baseSum = isValid ? results.monthlyPKR : 0
  const adjustments = isValid
    ? (results.extraPay - results.leaveDeduction + results.attendanceBonus - (results.providentFund ?? 0))
    : 0
  const salaryNet = isValid ? results.finalSalary : 0
  const netEffect = salaryNet + reimbursementPKR + annualBonusPKR

  const appliedAI = aiItems.filter(i => i.applied)
  const appliedLaptops = laptopItems.filter(i => i.applied)
  const hasReimbursements = reimbursementPKR > 0
  const hasAnnualBonus = annualBonusPKR > 0
  const hasExtras = hasReimbursements || hasAnnualBonus

  return (
    <div className="glass rounded-2xl">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm italic text-slate-400">fx</span>
          <span className="text-sm font-semibold text-slate-300 light:text-slate-600">Formula Breakdown</span>
        </div>
        <svg
          className={`h-5 w-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-white/10 px-5 pb-5 pt-4 light:border-slate-200">
          {/* Salary formula */}
          <div className="overflow-x-auto rounded-lg bg-slate-900/60 px-4 py-3 light:bg-slate-100">
            <code className="whitespace-nowrap text-sm leading-relaxed">
              <span className="text-blue-400 light:text-blue-600">Net_Pay</span>
              <span className="text-slate-400"> = </span>
              <span className="text-slate-300 light:text-slate-600">(Working_Days × Daily_Rate)</span>
              <span className="text-slate-400"> + </span>
              <span className="text-slate-300 light:text-slate-600">(Extra_Days × Overtime_Rate)</span>
              <span className="text-slate-400"> − </span>
              <span className="text-slate-300 light:text-slate-600">(Leave_Days × Daily_Rate)</span>
              {results.attendanceBonus > 0 && (
                <>
                  <span className="text-slate-400"> + </span>
                  <span className="text-emerald-400 light:text-emerald-600">Attendance_Bonus</span>
                </>
              )}
              {employeeType === 'fulltime' && (
                <>
                  <span className="text-slate-400"> − </span>
                  <span className="text-red-400 light:text-red-600">Provident_Fund(5%)</span>
                </>
              )}
              {hasAnnualBonus && (
                <>
                  <span className="text-slate-400"> + </span>
                  <span className="text-amber-400">
                    Annual_Bonus{annualBonusMode === 'percent' ? `(${annualBonusValue}%)` : ''}
                  </span>
                </>
              )}
              {appliedAI.map(item => (
                <span key={item.id}>
                  <span className="text-slate-400"> + </span>
                  <span className="text-violet-400">{item.name.replace(/\s+/g, '_')}</span>
                </span>
              ))}
              {appliedLaptops.map(item => (
                <span key={item.id}>
                  <span className="text-slate-400"> + </span>
                  <span className="text-emerald-400">{item.name.replace(/\s+/g, '_')}_Reimb</span>
                </span>
              ))}
            </code>
          </div>

          {/* Summary stats */}
          <div className={`mt-4 grid gap-4 border-t border-white/10 pt-4 light:border-slate-200 grid-cols-2 ${hasExtras ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Base Sum</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-200 light:text-slate-800">
                {fmtCurrency(baseSum, currency, dollarRate)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Adjustments</p>
              <p className={`mt-1 text-lg font-bold tabular-nums ${adjustments >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {adjustments >= 0 ? '+' : ''}{fmtCurrency(adjustments, currency, dollarRate)}
              </p>
            </div>
            {hasAnnualBonus && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Annual Bonus</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-amber-400">
                  +{fmtCurrency(annualBonusPKR, currency, dollarRate)}
                </p>
              </div>
            )}
            {hasReimbursements && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Reimbursements</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-violet-400">
                  +{fmtCurrency(reimbursementPKR, currency, dollarRate)}
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {hasExtras ? 'Total Earnings' : 'Net Effect'}
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums text-blue-400">
                {fmtCurrency(netEffect, currency, dollarRate)}
              </p>
            </div>
          </div>

          {/* Leave-Extra offset note */}
          {results.offsetDays > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2">
              <svg className="h-4 w-4 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[11px] text-amber-300 light:text-amber-600">
                {results.offsetDays} day{results.offsetDays !== 1 ? 's' : ''} offset: leave and extra cancel out.
                {results.remainingExtra > 0 && ` ${results.remainingExtra} extra day${results.remainingExtra !== 1 ? 's' : ''} paid at 1.5x overtime.`}
                {results.remainingLeave > 0 && ` ${results.remainingLeave} leave day${results.remainingLeave !== 1 ? 's' : ''} deducted at daily rate.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
