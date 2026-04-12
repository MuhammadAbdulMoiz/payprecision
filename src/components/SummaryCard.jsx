// SummaryCard shows the global currency and acts as the "toggle all" button.
// It does NOT maintain its own local state — clicking its button calls onGlobalToggle
// which changes the currency for all components simultaneously.
export default function SummaryCard({ finalSalary, isValid, globalCurrency = 'PKR', dollarRate = 1, onGlobalToggle }) {
  const displayAmount = isValid && typeof finalSalary === 'number' && !isNaN(finalSalary)
    ? (globalCurrency === 'USD' && dollarRate > 0 ? finalSalary / dollarRate : finalSalary)
    : null

  const formatted = displayAmount !== null
    ? displayAmount.toLocaleString(globalCurrency === 'USD' ? 'en-US' : 'en-PK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '---'

  const currencyLabel = globalCurrency === 'USD' ? '$' : 'PKR '

  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const payoutDate = nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 shadow-xl shadow-blue-500/20">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -right-4 top-12 h-20 w-20 rounded-full bg-white/5" />

      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
          Estimated Earnings
        </p>
        {onGlobalToggle && (
          <button
            onClick={onGlobalToggle}
            aria-label={`Toggle all to ${globalCurrency === 'PKR' ? 'USD' : 'PKR'}`}
            title="Toggle all cards"
            className="relative z-10 rounded-lg bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/30"
          >
            {globalCurrency === 'PKR' ? '$ Toggle All' : '₨ Toggle All'}
          </button>
        )}
      </div>

      <p className="mt-2 text-4xl font-extrabold tabular-nums text-white" aria-live="polite">
        <span className="text-2xl">{currencyLabel}</span>{formatted}
      </p>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Active Cycle</span>
        <span className="text-xs text-white/80">Next payout: {payoutDate}</span>
      </div>
    </div>
  )
}
