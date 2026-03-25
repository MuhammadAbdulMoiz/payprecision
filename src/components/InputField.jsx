import { useId } from 'react'

export default function InputField({
  label,
  value,
  onChange,
  error,
  disabled = false,
  step = 'any',
  tooltip,
}) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
        {tooltip && (
          <span className="group relative cursor-help">
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeWidth="2" d="M12 16v-4m0-4h.01" />
            </svg>
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      <input
        id={id}
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 light:bg-slate-100 light:text-slate-800 light:border-slate-200"
      />
      {error && (
        <p id={errorId} className="text-[11px] text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
