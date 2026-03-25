import ResultCard from './ResultCard'

export default function ResultsPanel({ results, isValid }) {
  const items = [
    { label: 'Base Salary (PKR)', value: results.monthlyPKR, prefix: 'PKR ' },
    { label: 'Daily Wage', value: results.dailyWage, prefix: 'PKR ', suffix: '/ day' },
    { label: 'Extra Pay', value: results.extraPay, prefix: 'PKR ' },
    { label: 'Leave Deduction', value: results.leaveDeduction, prefix: '-PKR ' },
  ]

  if (results.attendanceBonus > 0) {
    items.push({ label: 'Attendance Bonus', value: results.attendanceBonus, prefix: '+PKR ' })
  }

  return (
    <div aria-live="polite" className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <ResultCard
          key={item.label}
          label={item.label}
          value={isValid ? item.value : NaN}
          prefix={item.prefix}
          suffix={item.suffix}
        />
      ))}
    </div>
  )
}
