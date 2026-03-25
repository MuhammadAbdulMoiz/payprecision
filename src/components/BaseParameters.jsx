import SelectField from './SelectField'
import InputField from './InputField'
import MonthPicker from './MonthPicker'

export default function BaseParameters({
  employeeType, onEmployeeTypeChange,
  income, onIncomeChange,
  dollarRate, onDollarRateChange,
  workingDayMode, onWorkingDayModeChange,
  fixedWorkingDays, onFixedWorkingDaysChange,
  selectedMonth, onSelectedMonthChange,
  publicHolidays, onPublicHolidaysChange,
  dynamicWorkingDays,
  errors,
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
          <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 light:text-slate-600">
          Base Parameters
        </h2>
      </div>

      <div className="space-y-3">
        <SelectField
          label="Employee Type"
          value={employeeType}
          onChange={onEmployeeTypeChange}
          options={[
            { value: 'intern', label: 'Intern' },
            { value: 'fulltime', label: 'Full-time' },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Income (USD)"
            value={income}
            onChange={onIncomeChange}
            disabled={false}
            error={errors.income}
            tooltip="Monthly income in US Dollars"
          />
          <InputField
            label="Dollar Rate (PKR)"
            value={dollarRate}
            onChange={onDollarRateChange}
            error={errors.dollarRate}
            tooltip="Current USD to PKR exchange rate"
          />
        </div>

        <SelectField
          label="Working Days Mode"
          value={workingDayMode}
          onChange={onWorkingDayModeChange}
          options={[
            { value: 'fixed', label: 'Fixed' },
            { value: 'dynamic', label: 'Dynamic (by month)' },
          ]}
        />

        {workingDayMode === 'fixed' ? (
          <InputField
            label="Working Days"
            value={fixedWorkingDays}
            onChange={onFixedWorkingDaysChange}
            error={errors.workingDays}
            tooltip="Number of working days in month"
          />
        ) : (
          <MonthPicker
            selectedMonth={selectedMonth}
            onMonthChange={onSelectedMonthChange}
            publicHolidays={publicHolidays}
            onHolidaysChange={onPublicHolidaysChange}
            dynamicWorkingDays={dynamicWorkingDays}
            error={errors.holidays}
          />
        )}
      </div>
    </div>
  )
}
