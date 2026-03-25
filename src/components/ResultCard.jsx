import { useRef, useEffect, useState } from 'react'

export default function ResultCard({ label, value, suffix, prefix = '', highlight = false }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    prevRef.current = to

    if (typeof from !== 'number' || typeof to !== 'number' || isNaN(from) || isNaN(to)) {
      setDisplay(to)
      return
    }

    const duration = 300
    const start = performance.now()

    function tick(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value])

  const formatted = typeof display === 'number' && !isNaN(display)
    ? display.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '---'

  return (
    <div className={`rounded-xl p-4 transition-all ${
      highlight
        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
        : 'glass'
    }`}>
      <p className={`text-[11px] font-medium uppercase tracking-wider ${highlight ? 'text-blue-100' : 'text-slate-400'}`}>
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${highlight ? 'text-white' : 'text-slate-100 light:text-slate-800'}`}>
        {prefix}{formatted}
        {suffix && <span className="ml-1 text-xs font-normal opacity-60">{suffix}</span>}
      </p>
    </div>
  )
}
