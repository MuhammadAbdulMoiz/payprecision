export default function SummaryCard({ finalSalary, isValid }) {
  const formatted = isValid && typeof finalSalary === 'number' && !isNaN(finalSalary)
    ? finalSalary.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '---'

  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const payoutDate = nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 shadow-xl shadow-blue-500/20">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -right-4 top-12 h-20 w-20 rounded-full bg-white/5" />

      <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
        Estimated Earnings
      </p>
      <p className="mt-2 text-4xl font-extrabold tabular-nums text-white" aria-live="polite">
        <span className="text-2xl">PKR </span>{formatted}
      </p>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Active Cycle</span>
        <span className="text-xs text-white/80">Next payout: {payoutDate}</span>
      </div>
    </div>
  )
}
