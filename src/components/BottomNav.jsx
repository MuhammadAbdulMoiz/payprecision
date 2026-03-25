export default function BottomNav({ onReset, onCopy, finalSalary, isValid }) {
  const handleCopy = async () => {
    if (!isValid) return
    const text = `Final Salary: PKR ${finalSalary.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // fallback - clipboard not available
    }
  }

  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onReset}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/5 light:border-slate-200 light:text-slate-600 light:hover:bg-slate-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
        Reset
      </button>
      <button
        onClick={handleCopy}
        disabled={!isValid}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 disabled:opacity-50 disabled:shadow-none"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
        Copy Result
      </button>
    </div>
  )
}
