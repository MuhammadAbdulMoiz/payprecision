import { useId } from 'react'
import InputField from './InputField'

export default function MonthPicker({
  selectedMonth, onMonthChange,
  publicHolidays, onHolidaysChange,
  dynamicWorkingDays,
  error,
}) {
  const id = useId()

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Select Month
        </label>
        <input
          id={id}
          type="month"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 light:bg-slate-100 light:text-slate-800 light:border-slate-200"
        />
      </div>

      <InputField
        label="Public Holidays"
        value={publicHolidays}
        onChange={onHolidaysChange}
        step="1"
        error={error}
        tooltip="Public holidays to subtract from working days"
      />

      <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs text-blue-300 light:text-blue-600">
        Calculated working days: <span className="font-bold">{dynamicWorkingDays}</span>
      </div>
    </div>
  )
}
