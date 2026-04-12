import { useState, useEffect, useCallback } from 'react'
import ResultCard from './ResultCard'

export default function ResultsPanel({ results, isValid, globalCurrency = 'PKR', dollarRate = 1, employeeType = 'intern' }) {
  const buildItems = (res, empType) => {
    const base = [
      { label: 'Base Salary', value: res.monthlyPKR, prefix: 'PKR ', isMonetary: true },
      { label: 'Daily Wage', value: res.dailyWage, prefix: 'PKR ', suffix: '/ day', isMonetary: true },
      { label: 'Extra Pay', value: res.extraPay, prefix: 'PKR ', isMonetary: true },
      { label: 'Leave Deduction', value: res.leaveDeduction, prefix: '-PKR ', isMonetary: true },
    ]
    if (res.attendanceBonus > 0) {
      base.push({ label: 'Attendance Bonus', value: res.attendanceBonus, prefix: '+PKR ', isMonetary: true })
    }
    if (empType === 'fulltime') {
      base.push({ label: 'Provident Fund (5%)', value: res.providentFund ?? 0, prefix: '-PKR ', isMonetary: true })
    }
    return base
  }

  const items = buildItems(results, employeeType)

  // Per-card currency state: { [label]: 'PKR' | 'USD' }
  const [currencies, setCurrencies] = useState(() =>
    Object.fromEntries(items.map((i) => [i.label, globalCurrency]))
  )

  // Sync all cards when global currency changes
  useEffect(() => {
    setCurrencies((prev) => {
      const next = { ...prev }
      items.forEach((i) => { next[i.label] = globalCurrency })
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalCurrency])

  const toggleCard = useCallback((label) => {
    setCurrencies((prev) => ({
      ...prev,
      [label]: (prev[label] ?? globalCurrency) === 'PKR' ? 'USD' : 'PKR',
    }))
  }, [globalCurrency])

  return (
    <div aria-live="polite" className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <ResultCard
          key={item.label}
          label={item.label}
          value={isValid ? item.value : NaN}
          prefix={item.prefix}
          suffix={item.suffix}
          isMonetary={item.isMonetary}
          currency={currencies[item.label] ?? globalCurrency}
          dollarRate={dollarRate}
          onCurrencyToggle={() => toggleCard(item.label)}
        />
      ))}
    </div>
  )
}
