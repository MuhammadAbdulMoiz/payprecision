import { useRef, useEffect, useState } from 'react'

export default function ResultCard({
  label,
  value,
  suffix,
  prefix = '',
  highlight = false,
  currency = 'PKR',
  dollarRate = 1,
  onCurrencyToggle,
  isMonetary = true,
}) {
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

  // Currency-aware display computation
  const displayValue = isMonetary && currency === 'USD' && dollarRate > 0
    ? display / dollarRate
    : display

  const formatted = typeof displayValue === 'number' && !isNaN(displayValue)
    ? displayValue.toLocaleString(currency === 'USD' && isMonetary ? 'en-US' : 'en-PK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '---'

  // Preserve the sign prefix character (+/-) and switch the currency symbol
  let displayPrefix = prefix
  if (isMonetary && currency === 'USD') {
    if (prefix.startsWith('-')) displayPrefix = '-$'
    else if (prefix.startsWith('+')) displayPrefix = '+$'
    else displayPrefix = '$'
  }

  return (
    <div
      className={`relative rounded-xl p-4 transition-all ${
        highlight
          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
          : 'glass'
      }`}
    >
      {/* Currency toggle badge */}
      {isMonetary && onCurrencyToggle && (
        <button
          onClick={onCurrencyToggle}
          aria-label={`Switch to ${currency === 'PKR' ? 'USD' : 'PKR'}`}
          className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
            highlight
              ? 'bg-white/20 text-blue-100 hover:bg-white/30'
              : 'bg-white/10 text-slate-400 hover:bg-white/20'
          }`}
        >
          {currency}
        </button>
      )}

      <p className={`text-[11px] font-medium uppercase tracking-wider ${highlight ? 'text-blue-100' : 'text-slate-400'}`}>
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${highlight ? 'text-white' : 'text-slate-100 light:text-slate-800'}`}>
        {displayPrefix}{formatted}
        {suffix && <span className="ml-1 text-xs font-normal opacity-60">{suffix}</span>}
      </p>
    </div>
  )
}
